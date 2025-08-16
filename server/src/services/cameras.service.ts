import { pool } from '../config/db';

export async function listCameras() {
    const result = await pool.query(
        "SELECT * FROM cameras"
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

export async function changeStatus(id: number, status: boolean) {
    const result = await pool.query(
        "UPDATE cameras SET cam_status = $1 WHERE cam_id = $2 RETURNING *",
        [status, id]
    );
    return result.rows[0]; // คืนค่ากล้องที่ถูกอัพเดต
}
