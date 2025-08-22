import { pool } from '../config/db';
import * as Model from '../models/alerts.model'
import * as Mapping from '../models/Mapping/alerts.map'

/**
 * ดึงรายการ Alert ทั้งหมดที่ใช้งานอยู่
 *
 * @returns {Promise<Alert[]>} รายการ Alert ที่ถูกใช้งานอยู่ทั้งหมด
 * @description ดึงข้อมูล Alert จากฐานข้อมูลโดย join กับตาราง cameras, footages, และ events
 * 
 * @author Wanasart
 */
export async function getAlertList() {
    const result = await pool.query<Model.Alert>(`
        SELECT * FROM alerts
        JOIN cameras ON cam_id = alr_camera_id
        JOIN locations ON loc_id = cam_location_id
        JOIN footages ON fgt_id = alr_footage_id
        JOIN events ON evt_id = alr_event_id
        WHERE alr_is_use = true
        ORDER BY alr_create_date DESC
    `);

    // return result.rows.map(mapToAlert);
    return result.rows.map(Mapping.mapToAlert);
}

/**
 * ดึง log ของ Alert ตามรหัส alr_id ที่กำหนด
 *
 * @param {number} alr_id - รหัสของ Alert ที่ต้องการดู log
 * @returns {Promise<Log>} รายการ log ของ Alert ที่เจอ
 * 
 * @author Wanasart
 */
export async function getAlertLogs(alr_id: number): Promise<Model.Log> {
    const { rows } = await pool.query(
        `SELECT loa_id, loa_event_name, loa_create_date, loa_user_id
       FROM log_alerts
       WHERE loa_alert_id = $1
       ORDER BY loa_create_date DESC`,
        [alr_id]
    );

    return { alert_id: alr_id, log: rows.map(Mapping.mapRowToLogItem) };
}

/**
 * ดึงรายการ Alert ที่เกี่ยวข้องกับ Event ตามรหัส evt_id ที่กำหนด
 *
 * @param {number} evt_id - รหัสของ Event ที่ต้องการดู Alert ที่เกี่ยวข้อง
 * @returns {Promise<Related>} รายการ Alert ที่เกี่ยวข้องกับ Event ที่เจอ
 * 
 * @author Wanasart
 */
export async function getAlertRelated(evt_id: number): Promise<Model.Related> {
    const { rows } = await pool.query(`
        SELECT * FROM alerts
        WHERE alr_event_id = $1 
        AND alr_is_use = true 
        AND alr_status != 'Active'
    `, [evt_id]);

    return { event_id: evt_id, alert: rows.map(Mapping.mapRowToAlertItem) };
}

/**
 * ดึงหมายเหตุของ Alert ตามรหัส alr_id ที่กำหนด
 *
 * @param {number} alr_id - รหัสของ Alert ที่ต้องการดูหมายเหตุ
 * @returns {Promise<Note>} รายการหมายเหตุของ Alert ที่เจอ
 * 
 * @author Wanasart
 */
export async function getAlertNotes(alr_id: number): Promise<Model.Note> {
    const { rows } = await pool.query(`
        SELECT * FROM alert_note_history
        WHERE anh_alert_id = $1
        AND anh_is_use = true
    `, [alr_id]);

    return { alert_id: alr_id, notes: rows.map(Mapping.mapRowToNoteItem) };
}

/**
 * ดึงแนวโน้มของ Alert ตามวันที่และความรุนแรงในช่วงวันที่ที่กำหนด
 *
 * @param {number} daysBack - จำนวนวันที่ต้องการดึงข้อมูลย้อนหลัง (ค่าเริ่มต้นคือ 7 วัน)
 * @returns {Promise<Trend[]>} รายการแนวโน้มของ Alert ที่ถูกจัดกลุ่มตามวันที่และความรุนแรง
 * 
 * @author Wanasart
 */
export async function getAlertTrend(daysBack = 7): Promise<Model.Trend[]> {
    const { rows } = await pool.query<{
        alert_date: string | Date;
        alr_severity: string;
        count: number | string;
    }>(
        `
      SELECT
        date_trunc('day', alr_create_date)::date AS alert_date,
        alr_severity,
        COUNT(*)::int AS count
      FROM alerts
      GROUP BY alert_date, alr_severity
      ORDER BY alert_date ASC, alr_severity ASC
      `);
    // }>(
    //   `
    //   SELECT
    //     date_trunc('day', alr_create_date)::date AS alert_date,
    //     alr_severity,
    //     COUNT(*)::int AS count
    //   FROM alerts
    //   WHERE alr_create_date >= CURRENT_DATE - ($1::int - 1)
    //     AND alr_create_date <  CURRENT_DATE + INTERVAL '1 day'
    //   GROUP BY alert_date, alr_severity
    //   ORDER BY alert_date ASC, alr_severity ASC
    //   `,
    //   [daysBack]
    // );

    // group by date (string 'YYYY-MM-DD')
    const grouped = new Map<string, Model.TrendAlertItem[]>();

    for (const row of rows) {
        const dateOnly =
            row.alert_date instanceof Date
                ? row.alert_date.toISOString().slice(0, 10)
                : String(row.alert_date);

        if (!grouped.has(dateOnly)) grouped.set(dateOnly, []);
        grouped.get(dateOnly)!.push(Mapping.mapRowToTrendItem(row));
    }

    return Array.from(grouped.entries())
        .map(([date, trend]) => ({ date, trend }))
        .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * ดึงรายการ Alert ตามประเภท Event ที่ใช้งานอยู่
 *
 * @returns {Promise<any[]>} รายการ Alert ที่ถูกจัดกลุ่มตาม evt_name
 * 
 * @author Wanasart
 */
export async function getAlertByEventType() {
    const result = await pool.query(`
        SELECT evt_name, COUNT(*)
        FROM alerts
        JOIN events ON evt_id = alr_event_id
        WHERE alr_is_use = true
        GROUP BY evt_name
    `);

    return result.rows;
}

/**
 * สร้าง Alert ใหม่ในฐานข้อมูล
 *
 * @param {string} severity - ความรุนแรงของ Alert (เช่น 'High', 'Medium', 'Low')
 * @param {number} camera_id - รหัสกล้องที่เกี่ยวข้องกับ Alert
 * @param {number} footage_id - รหัส Footage ที่เกี่ยวข้องกับ Alert
 * @param {number} event_id - รหัส Event ที่เกี่ยวข้องกับ Alert
 * @param {string} description - คำอธิบายของ Alert
 * @returns {Promise<Alert>} Alert object ที่ถูกสร้างขึ้นใหม่
 * @throws {Error} ถ้ากล้องไม่ออนไลน์หรือไม่ใช้งาน, หรือถ้าไม่สามารถสร้าง Alert ได้
 * 
 * @author Wanasart
 */
export async function createAlert(severity: string, camera_id: number, footage_id: number, event_id: number, description: string) {
    const cameraExists = await pool.query(`
        SELECT cam_id FROM cameras 
        WHERE cam_id = $1 
        AND cam_is_use = true
        AND cam_status = true
    `, [camera_id]);

    if (cameraExists.rows.length === 0) {
        throw new Error('Camera offline or not in use');
    }
    
    const { rows } = await pool.query(`
        INSERT INTO alerts(
	    alr_severity, alr_camera_id, alr_footage_id, alr_event_id, alr_description)
	    VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `, [severity, camera_id, footage_id, event_id, description]);

    if (rows.length === 0) {
        throw new Error('Failed to create alert');
    }

    return rows[0];
}

/**
 * อัปเดตสถานะของ Alert ตามรหัสที่กำหนด
 *
 * @param {number} id - รหัสของ Alert ที่ต้องการอัปเดต
 * @param {string} status - สถานะใหม่ที่ต้องการตั้งให้กับ Alert (เช่น 'Resolved', 'Dismissed')
 * @returns {Promise<Alert>} Alert object ที่ถูกอัปเดต
 * @throws {Error} ถ้าไม่พบ Alert หรือไม่สามารถอัปเดตได้
 * 
 * @author Wanasart
 */
export async function updateAlert(id: number, status: string) {
    const alertExists = await pool.query(`
        SELECT alr_id FROM alerts 
        WHERE alr_id = $1
        AND alr_is_use = true
        AND alr_status = 'Active'
    `, [id]);

    if (alertExists.rows.length === 0) {
        throw new Error('Alert not found or already resolved/dismissed');
    }
    const { rows } = await pool.query(`
        UPDATE alerts
        SET alr_status = $2
        WHERE alr_id = $1
        RETURNING *
    `, [id, status]);

    if (rows.length === 0) {
        throw new Error('Failed to update alert');
    }

    return rows[0];
}

/**
 * ลบ Alert ตามรหัสที่กำหนดโดยการอัปเดตสถานะเป็น false
 *
 * @param {number} id - รหัสของ Alert ที่ต้องการลบ
 * @returns {Promise<Alert>} Alert object ที่ถูกลบ
 * @throws {Error} ถ้าไม่พบ Alert หรือไม่สามารถลบได้
 * 
 * @author Wanasart
 */
export async function deleteAlert(id: number): Promise<Model.AlertSafeDelete> {
    const alertExists = await pool.query(`
        SELECT alr_id FROM alerts 
        WHERE alr_id = $1
        AND alr_is_use = true
    `, [id]);

    if (alertExists.rows.length === 0) {
        throw new Error('Alert not found');
    }

    const { rows } = await pool.query(`
        UPDATE alerts
        SET alr_is_use = false
        WHERE alr_id = $1
        RETURNING *
    `, [id]);

    if (rows.length === 0) {
        throw new Error('Failed to delete alert');
    }

    return Mapping.mapRowToAlertItemDelete(rows[0]);
}