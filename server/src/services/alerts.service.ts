import { pool } from '../config/db';
import { Alert, mapToAlert, InsertAlert } from '../models/alerts.model';

/**
 * ดึงรายการ Alert ที่ถูกใช้งานอยู่ทั้งหมดจากฐานข้อมูล
 *
 * @returns {Promise<Alert[]>} รายการ Alert ทั้งหมดที่ alr_is_use = true
 * 
 * @author Wanasart
 */
export async function getAlertList() {
    const result = await pool.query<Alert>(`
        SELECT * FROM alerts
        JOIN cameras ON cam_id = alr_camera_id
        JOIN footages ON fgt_id = alr_footage_id
        JOIN events ON evt_id = alr_event_id
        WHERE alr_is_use = true
    `);

    return result.rows.map(mapToAlert);
}

/**
 * ดึง Log ของ Alert ตามรหัส alr_id ที่กำหนด
 *
 * @param {number} alr_id - รหัสของ Alert ที่ต้องการดู log
 * @returns {Promise<any[]>} รายการ log ของ Alert ที่เจอ
 * 
 * @author Wanasart
 */
export async function getAlertLogs(alr_id: number) {
    const result = await pool.query(`
        SELECT * FROM log_alerts
        WHERE loa_alert_id = $1
    `, [alr_id]);

    return result.rows;
}

/**
 * ดึงรายการ Alert ที่เกี่ยวข้องกับ Event ตามรหัส evt_id ที่กำหนด
 *
 * @param {number} evt_id - รหัสของ Event ที่ต้องการดึง Alert ที่เกี่ยวข้อง
 * @returns {Promise<Alert[]>} รายการ Alert ที่เกี่ยวข้องกับ Event ที่เจอ
 * 
 * @author Wanasart
 */
export async function getAlertRelated(evt_id: number) {
    const result = await pool.query(`
        SELECT * FROM alerts
        WHERE alr_event_id = $1 
        AND alr_is_use = true 
        AND alr_status != 'Active'
    `, [evt_id]);

    return result.rows;
}

/**
 * ดึงรายการ Note ของ Alert ตามรหัส alr_id ที่กำหนด
 *
 * @param {number} alr_id - รหัสของ Alert ที่ต้องการดู Note
 * @returns {Promise<any[]>} รายการ Note ของ Alert ที่เจอ
 * 
 * @author Wanasart
 */
export async function getAlertNotes(alr_id: number) {
    const result = await pool.query(`
        SELECT * FROM alert_note_history
        WHERE anh_alert_id = $1
        AND anh_is_use = true
    `, [alr_id]);

    return result.rows;
}

/**
 * ดึงกราฟแนวโน้มของ Alert ตามจำนวนวันที่กำหนด
 *
 * @param {number} days_back - จำนวนวันที่ต้องการดูแนวโน้มย้อนหลัง
 * @returns {Promise<any[]>} รายการแนวโน้มของ Alert ที่เจอ
 * 
 * @author Wanasart
 */
export async function getAlertTrend(days_back: number){
    const result = await pool.query(`
        SELECT alr_severity, date_trunc('day', alr_create_date)::date AS alert_date, COUNT(*) AS severity_count
        FROM alerts
        JOIN events ON alr_event_id = evt_id
        WHERE alr_create_date >= CURRENT_DATE - ($1 || ' days')::interval
        AND alr_create_date <  CURRENT_DATE + INTERVAL '1 day'
        GROUP BY alr_severity, alert_date
        ORDER BY alert_date ASC, alr_severity ASC
    `, [days_back]);

    return result.rows;
}

/**
 * ดึงรายการ Alert ตามประเภท Event ที่ใช้งานอยู่
 *
 * @returns {Promise<any[]>} รายการ Alert ที่ถูกจัดกลุ่มตาม evt_name
 * 
 * @author Wanasart
 */
export async function getAlertByEventType(){
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