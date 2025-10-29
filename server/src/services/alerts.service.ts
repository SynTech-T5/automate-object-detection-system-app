import { pool } from '../config/db';
import * as Model from '../models/alerts.model'
import * as Mapping from '../models/Mapping/alerts.map'

// ✅ 2025-10-27
export async function getAlerts() {
    const { rows } = await pool.query(`
        SELECT * FROM v_alerts_overview
        ORDER BY created_at DESC;
    `);

    return rows;
}

// ✅ 2025-10-27
export async function getAlertById(alert_id: number) {
    const { rows } = await pool.query(`
        SELECT * FROM v_alerts_overview
        WHERE alert_id = $1;
    `, [alert_id]);

    return rows[0];
}

// ✅ 2025-10-28
export async function getAlertLogs(alert_id: number) {
    const { rows } = await pool.query(`
        SELECT
            alg_id, 
            alg_usr_id,
            usr_username,
            usr_name,
            rol_name,
            alg_alr_id, 
            alg_action, 
            alg_created_at
        FROM alert_logs
        JOIN users ON alg_usr_id = usr_id
        JOIN roles ON usr_rol_id = rol_id
        WHERE alg_alr_id = $1;
    `, [alert_id]);

    return rows.map(Mapping.mapLogsToSaveResponse);
}

// ✅ 2025-10-28
export async function getAlertRelated(alert_id: number) {
    const event_name_result = await pool.query(`
        SELECT event_name 
        FROM v_alerts_overview
        WHERE alert_id = $1;
    `, [alert_id]);

    const { rows } = await pool.query(`
        SELECT * FROM v_alerts_overview
        WHERE event_name = $1
        ORDER BY created_at DESC;
    `, [event_name_result.rows[0].event_name]);

    return rows;
}

// ✅ 2025-10-28
export async function getAlertNotes(alert_id: number) {
    const { rows } = await pool.query(`
        SELECT
            anh_id, 
            anh_usr_id,
            usr_username,
            usr_name,
            rol_name,
            anh_alr_id, 
            anh_note, 
            anh_created_at, 
            anh_updated_at
        FROM alert_note_history
        JOIN users ON anh_usr_id = usr_id
        JOIN roles ON usr_rol_id = rol_id
        WHERE anh_alr_id = $1
        AND anh_is_use = true
        ORDER BY anh_created_at DESC;
    `, [alert_id]);

    return rows.map(Mapping.mapNotesToSaveResponse);
}

// ✅ 2025-10-29
export async function getRecentCameraAlert() {
    const { rows } = await pool.query(`
        SELECT * FROM v_cameras_latest_alert
        WHERE last_alert_at >= NOW() - INTERVAL '24 hours';
    `);

    return rows;
}

// ✅ 2025-10-28
export async function insertAlertNote(
    user_id: number, 
    alert_id: number, 
    note: string
){
    const { rows } = await pool.query(`
        INSERT INTO alert_note_history(
            anh_usr_id,
            anh_alr_id,
            anh_note,
            anh_created_at,
            anh_updated_at
        ) VALUES($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *;
    `, [user_id, alert_id, note]);

    return Mapping.mapNotesToSaveResponse(rows[0]);
}

// ✅ 2025-10-28
export async function updateAlertNote(
    user_id: number,
    note_id: number, 
    note: string
){
    const { rows } = await pool.query(`
        UPDATE alert_note_history
        SET 
            anh_note = $1,
            anh_updated_at = CURRENT_TIMESTAMP
        WHERE anh_id = $2
        RETURNING *;
    `, [note, note_id]);

    return Mapping.mapNotesToSaveResponse(rows[0]);
}

// ✅ 2025-10-28
export async function removeAlertNote(
    note_id: number
){
    const { rows } = await pool.query(`
        UPDATE alert_note_history
        SET
            anh_is_use = false,
            anh_updated_at = CURRENT_TIMESTAMP
        WHERE anh_id = $1
        RETURNING *;
    `, [note_id]);

    return Mapping.mapNotesToSaveResponse(rows[0]);
}


// ✅ 2025-10-27
export async function insertAlert(
    user_id: number, 
    camera_id: number, 
    footage_id: number, 
    event_id: number, 
    severity: string, 
    description: string
) {
    const { rows } = await pool.query(`
        INSERT INTO alerts(
            alr_created_by, 
            alr_cam_id, 
            alr_fgt_id, 
            alr_evt_id, 
            alr_severity, 
            alr_description
        ) VALUES($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `,[
        user_id, 
        camera_id, 
        footage_id, 
        event_id, 
        severity, 
        description
    ]);

    const log = await pool.query(`
      INSERT INTO alert_logs(
        alg_usr_id, 
        alg_alr_id, 
        alg_action, 
        alg_created_at
      )
      VALUES($1, $2, $3, CURRENT_TIMESTAMP);
    `,[
        user_id,
        rows[0].alr_id,
        'CREATE_ALERT',
      ]);

    return Mapping.mapAlertToSaveResponse(rows[0]);
}

// ✅ 2025-10-29
export async function updateAlertStatus(alert_id: number, status: string, reason: string, user_id: number) {
    const { rows } = await pool.query(`
        UPDATE alerts
        SET 
            alr_status = $1,
            alr_reason = $2
        WHERE alr_id = $3
        RETURNING *;
    `, [status, reason, alert_id]);

    const log = await pool.query(`
      INSERT INTO alert_logs(
        alg_usr_id, 
        alg_alr_id, 
        alg_action, 
        alg_created_at
      )
      VALUES($1, $2, $3, CURRENT_TIMESTAMP);
    `,[
        user_id,
        rows[0].alr_id,
        `UPDATE_STATUS`,
      ]);

    return Mapping.mapAlertToSaveResponse(rows[0]);
}

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
 * นับจำนวน Alert ตามสถานะต่าง ๆ
 *
 * @returns {Promise<Model.AlertStatus>} สถานะของ Alert ที่ถูกนับ
 * @description ดึงข้อมูล Alert จากฐานข้อมูลและนับจำนวนตามสถานะต่าง ๆ เช่น Active, Resolved, Critical
 * 
 * @author Wanasart
 */
export async function countStatusAlerts(): Promise<Model.AlertStatus> {
    const { rows } = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE alr_is_use = true) AS total,
        COUNT(*) FILTER (WHERE alr_is_use = true AND alr_status = 'Active') AS active,
        COUNT(*) FILTER (WHERE alr_is_use = true AND alr_status = 'Resolved') AS resolved,
        COUNT(*) FILTER (WHERE alr_is_use = true AND alr_status = 'Dismissed') AS dismissed,
        COUNT(*) FILTER (WHERE alr_is_use = true AND alr_severity = 'Critical') AS critical,
        COUNT(*) FILTER (WHERE alr_is_use = true AND alr_severity = 'High') AS high,
        COUNT(*) FILTER (WHERE alr_is_use = true AND alr_severity = 'Medium') AS medium,
        COUNT(*) FILTER (WHERE alr_is_use = true AND alr_severity = 'Low') AS low
      FROM alerts
    `);
  
    const r = rows[0];
    return {
      total: Number(r.total),
      active: Number(r.active),
      resolved: Number(r.resolved),
      dismissed: Number(r.dismissed),
      critical: Number(r.critical),
      high: Number(r.high),
      medium: Number(r.medium),
      low: Number(r.low),
    };
  }

/**
 * ดึง log ของ Alert ตามรหัส alr_id ที่กำหนด
 *
 * @param {number} alr_id - รหัสของ Alert ที่ต้องการดู log
 * @returns {Promise<Log>} รายการ log ของ Alert ที่เจอ
 * 
 * @author Wanasart
 */
// export async function getAlertLogs(alr_id: number): Promise<Model.Log> {
//     const { rows } = await pool.query(
//         `SELECT loa_id, loa_event_name, loa_create_date, loa_user_id
//        FROM log_alerts
//        WHERE loa_alert_id = $1
//        ORDER BY loa_create_date DESC`,
//         [alr_id]
//     );

//     return { alert_id: alr_id, log: rows.map(Mapping.mapRowToLogItem) };
// }

/**
 * ดึงรายการ Alert ที่เกี่ยวข้องกับ Event ตามรหัส evt_id ที่กำหนด
 *
 * @param {number} evt_id - รหัสของ Event ที่ต้องการดู Alert ที่เกี่ยวข้อง
 * @returns {Promise<Related>} รายการ Alert ที่เกี่ยวข้องกับ Event ที่เจอ
 * 
 * @author Wanasart
 */
// export async function getAlertRelated(evt_id: number): Promise<Model.Related> {
//     const { rows } = await pool.query(`
//         SELECT * FROM alerts
//         WHERE alr_event_id = $1 
//         AND alr_is_use = true 
//         AND alr_status != 'Active'
//     `, [evt_id]);

//     return { event_id: evt_id, alert: rows.map(Mapping.mapRowToAlertItem) };
// }

/**
 * ดึงหมายเหตุของ Alert ตามรหัส alr_id ที่กำหนด
 *
 * @param {number} alr_id - รหัสของ Alert ที่ต้องการดูหมายเหตุ
 * @returns {Promise<Note>} รายการหมายเหตุของ Alert ที่เจอ
 * 
 * @author Wanasart
 */
// export async function getAlertNotes(alr_id: number): Promise<Model.Note> {
//     const { rows } = await pool.query(`
//         SELECT * FROM alert_note_history
//         WHERE anh_alert_id = $1
//         AND anh_is_use = true
//     `, [alr_id]);

//     return { alert_id: alr_id, notes: rows.map(Mapping.mapRowToNoteItem) };
// }

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
      ((alr_create_date AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Bangkok')::date AS alert_date,
      alr_severity,
      COUNT(*)::int AS count
      FROM alerts
      WHERE alr_is_use = true
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

