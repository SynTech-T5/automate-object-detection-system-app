import { pool } from '../config/db';
import { Alert } from '../models/alerts.model';

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
        WHERE alr_is_use = true
    `);

    return result.rows;
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