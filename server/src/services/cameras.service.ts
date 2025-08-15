import { pool } from '../config/db';

export async function listCameras() {
    const result = await pool.query(
        "SELECT * FROM cameras"
    );
    return result.rows;
}
export async function totalCameras() {
    const result = await pool.query(
        "SELECT COUNT(*) FROM cameras WHERE cam_is_use = true"
    );
    return result.rows;
}