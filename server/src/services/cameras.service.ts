import { pool } from '../config/db';

export async function listCameras() {
    const result = await pool.query(
        "SELECT * FROM cameras"
    );
    return result.rows;
}

/**
 * ดึงรายการประวัติการซ่อมบำรุงทั้งหมด
 *
 * @returns {Promise<any[]>} รายการประวัติการซ่อมบำรุงทั้งหมด
 * 
 * @author Jirayu
 * 
 */
export async function getAllMaintenanceHistory() {
    const query = `
        SELECT 
            mnt_id,
            mnt_date,
            mnt_type,
            mnt_technician,
            mnt_note,
            mnt_is_use,
            mnt_camera_id
        FROM maintenance_history 
        WHERE mnt_is_use = true
        ORDER BY mnt_date DESC
    `;

    const result = await pool.query(query);

    return result.rows;
}