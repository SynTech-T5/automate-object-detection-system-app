import { pool } from '../config/db';

export async function listCameras() {
    const result = await pool.query(
        "SELECT * FROM cameras"
    );
    return result.rows;
}

/**
 * ดึงรายการ Camera Cards พร้อมข้อมูล Location
 *
 * @returns {Promise<any[]>} รายการกล้อง
 * (id, status, name, type, health, location)
 * 
 * @author Wongsakon
 */
export async function cameraCards() {
    const result = await pool.query(
        "SELECT cam_id, cam_status, cam_name, cam_type, cam_health, loc_name FROM cameras INNER JOIN locations ON cam_location_id = loc_id"
    );
    return result.rows;
}
