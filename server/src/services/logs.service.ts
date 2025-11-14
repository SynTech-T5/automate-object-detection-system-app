import { pool } from "../config/db";
import * as Mapping from "../models/Mapping/logs.map";

// 2025-10-31
export async function getCameraLogs(){
    const { rows } = await pool.query(`
        SELECT
            clg_id, 
            clg_usr_id, 
            clg_cam_id, 
            clg_action, 
            clg_created_at
        FROM camera_logs
        ORDER BY clg_created_at DESC;
    `);

    return rows.map(Mapping.mapCameraLogsToSaveResponse);
}

// 2025-10-31
export async function getAlertLogs(){
    const { rows } = await pool.query(`
        SELECT
            alg_id, 
            alg_usr_id, 
            alg_alr_id, 
            alg_action, 
            alg_created_at
        FROM alert_logs
        ORDER BY alg_created_at DESC;
    `);

    return rows.map(Mapping.mapAlertLogsToSaveResponse);
}