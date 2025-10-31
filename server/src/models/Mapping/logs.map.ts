import * as Model from "../../models/logs.model"
import { splitDateTime } from "./timeDate.map"

export const mapCameraLogsToSaveResponse = (row: any): Model.Camera => {

    const createdAt = splitDateTime(row.clg_created_at);

    return {
        log_id: row.clg_id,
        user_id: row.clg_usr_id,
        camera_id: row.clg_cam_id,
        log_action: row.clg_action,
        log_created_at: createdAt.date + ' ' + createdAt.time
    }
};

export const mapAlertLogsToSaveResponse = (row: any): Model.Alert => {

    const createdAt = splitDateTime(row.alg_created_at);

    return {
        log_id: row.alg_id,
        user_id: row.alg_usr_id,
        alert_id: row.alg_alr_id,
        log_action: row.alg_action,
        log_created_at: createdAt.date + ' ' + createdAt.time
    }
};