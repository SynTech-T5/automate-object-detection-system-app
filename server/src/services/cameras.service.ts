import { pool } from '../config/db';

/**
 * ดึงรายการกล้องทั้งหมดจากฐานข้อมูล
 *
 * @returns {Promise<any[]>} รายการกล้องทั้งหมด
 * 
 * @author Wanasart
 */
export async function listCameras() {
    const result = await pool.query(
        "SELECT * FROM cameras"
    );
    return result.rows;
}

/**
 * นับจำนวนกล้องทั้งหมดที่ใช้งานอยู่
 *
 * @returns {Promise<any[]>} จำนวนกล้องที่ใช้งานอยู่ทั้งหมด
 * 
 * @author Premsirigul
 */
export async function totalCameras() {
    const result = await pool.query(
        "SELECT COUNT(*) FROM cameras WHERE cam_is_use = true"
    );
    return result.rows;
}

/**
 * ดึงรายการประวัติการซ่อมบำรุงกล้องทั้งหมด
 *
 * @returns {Promise<any[]>} รายการประวัติการซ่อมบำรุงกล้องทั้งหมด
 * @description ดึงข้อมูลประวัติการซ่อมบำรุงจากฐานข้อมูลโดยเรียงตามวันที่จากใหม่ไปเก่า
*
 * @author Jirayu
 */
export async function getAllMaintenanceHistory(): Promise<any[]> {
    const query = `
        SELECT 
            mnt_date,
            mnt_type,
            mnt_technician,
            mnt_note
        FROM maintenance_history 
        WHERE mnt_is_use = true
        ORDER BY mnt_date DESC
    `;

    const { rows } = await pool.query(query);
    return rows;
}

/**
 * ดึงรายการประวัติการซ่อมบำรุงตามรหัสกล้อง
 *
 * @param {number} cam_id - รหัสกล้องที่ต้องการดูประวัติการซ่อมบำรุง
 * @returns {Promise<any[]>} รายการประวัติการซ่อมบำรุงของกล้องที่ระบุ
 * @description ดึงข้อมูลประวัติการซ่อมบำรุงจากฐานข้อมูลตามรหัสกล้อง
 * 
 * @author Jirayu
 */
export async function getMaintenanceHistoryByCamId(cam_id: number): Promise<any[]> {
    const query = `
        SELECT 
            mnt_date,
            mnt_type,
            mnt_technician,
            mnt_note
        FROM maintenance_history 
        WHERE mnt_camera_id = $1 
        AND mnt_is_use = true
        ORDER BY mnt_date DESC
    `;



    const result = await pool.query(query,[cam_id]);

    return result.rows;
}

/**
 * เปลี่ยนสถานะของกล้อง
 *
 * @param {string} cam_id - ไอดีของ cam ที่จะเปลี่ยนสถานะ
 * @param {string} cam_status - สถานะที่จะเปลี่ยน
 * @returns {Promise<any[]>} กล้องที่ถูกอัปเดต
 * 
 * @author Audomsak
 * 
 */
export async function changeStatus(cam_id: number, cam_status: boolean) {
    const result = await pool.query(
        "UPDATE cameras SET cam_status = $1 WHERE cam_id = $2 RETURNING *",
        [cam_status, cam_id]
    );
    return result.rows[0]; // คืนค่ากล้องที่ถูกอัพเดต
}

/**
 * ดึงรายการ Event Detection จากฐานข้อมูล
 *
 * @returns {Promise<any[]>} รายการ Event Detection
 * (icon, name, sensitivity, priority, status)
 * @description
 * ฟังก์ชันนี้จะ query join ข้อมูลระหว่าง events กับ camera_detection_settings
 * โดยใช้ evt_id = cds_event_id เพื่อดึงรายละเอียดที่จำเป็นสำหรับการแสดงผล
 * 
 * @author Wongsakon
 */
export async function eventDetection() {
    const result = await pool.query(
        "SELECT evt_icon, evt_name, cds_sensitivity, cds_priority, cds_status FROM events INNER JOIN camera_detection_settings ON evt_id = cds_event_id"
    );
    return result.rows;
}