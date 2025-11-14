import * as Model from "../alerts.model";
import { splitDateTime } from "./timeDate.map"

export function mapAlertToSaveResponse(row: any): Model.Alerts {

    const createdAt = splitDateTime(row.alr_created_at);
    const updatedAt = splitDateTime(row.alr_updated_at);

    return {
        alert_id: row.alr_id,
        creator_id: row.alr_created_by,
        camera_id: row.alr_cam_id,
        footage_id: row.alr_fgt_id,
        event_id: row.alr_evt_id,
        alert_severity: row.alr_severity,
        alert_status: row.alr_status,
        alert_description: row.alr_description,
        alert_created_at: createdAt.date + ' ' + createdAt.time,
        alert_updated_at: updatedAt.date + ' ' + updatedAt.time,
        alert_is_use: row.alr_is_use
    };
}

export function mapLogsToSaveResponse(row: any): Model.Logs {

    const createdAt = splitDateTime(row.alg_created_at);

    return {
        log_id: row.alg_id,
        creator_id: row.alg_usr_id,
        creator_username: row.usr_username,
        creator_name: row.usr_name,
        creator_role: row.rol_name,
        alert_id: row.alg_alr_id,
        action: row.alg_action,
        created_at: createdAt.date + ' ' + createdAt.time,
    };
}

export function mapNotesToSaveResponse(row: any): Model.Notes {

    const createdAt = splitDateTime(row.anh_created_at);
    const updatedAt = splitDateTime(row.anh_updated_at);

    return {
        note_id: row.anh_id,
        creator_id: row.anh_usr_id,
        creator_username: row.usr_username,
        creator_name: row.usr_name,
        creator_role: row.rol_name,
        alert_id: row.anh_alr_id,
        note: row.anh_note,
        note_created_at: createdAt.date + ' ' + createdAt.time,
        note_updated_at: updatedAt.date + ' ' + updatedAt.time,
        note_is_use: row.anh_is_use
    };
}