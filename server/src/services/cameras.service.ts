import { pool } from '../config/db';

export async function listCameras() {
    const result = await pool.query(
        "SELECT * FROM cameras"
    );
    return result.rows;
}

export async function cameraCards() {
    const result = await pool.query(
        "SELECT cam_id, cam_status, cam_name, cam_type, cam_health, loc_name FROM cameras INNER JOIN locations ON cam_location_id = loc_id"
    );
    return result.rows;
}
