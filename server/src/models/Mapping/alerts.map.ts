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






export function mapToAlert(row: any): Model.Alert {

    const alert = splitDateTime(row.alr_create_date);
    const camera = splitDateTime(row.cam_installation_date);
    const footage_start = splitDateTime(row.fgt_start_ts);
    const footage_end = splitDateTime(row.fgt_end_ts);

    return {
        id: row.alr_id,
        severity: row.alr_severity,
        create_date: alert.date,
        create_time: alert.time,
        status: row.alr_status,
        is_use: row.alr_is_use,
        description: row.alr_description,

        camera: {
            id: row.cam_id,
            name: row.cam_name,
            address: row.cam_address,
            type: row.cam_type,
            resolution: row.cam_resolution,
            description: row.cam_description,
            status: row.cam_status,
            installation_date: camera.date,
            installation_time: camera.time,
            health: Number(row.cam_health),
            video_quality: Number(row.cam_video_quality),
            network_latency: row.cam_network_latency,
            is_use: row.cam_is_use,
            location: {
                id: row.loc_id,
                name: row.loc_name,
            }
        },

        footage: {
            id: row.fgt_id,
            url: row.fgt_url,
            start_ts: footage_start.time,
            end_ts: footage_end.time,
        },

        event: {
            id: row.evt_id,
            icon: row.evt_icon,
            name: row.evt_name,
            description: row.evt_description,
            is_use: row.evt_is_use,
        },
    };
}

export const mapRowToAlertItem = (row: any): Model.AlertSafe => {
  
    const { date, time } = splitDateTime(row.alr_create_date);
  
    return {
      id: row.alr_id,
      severity: row.alr_severity,
      create_date: date,              
      create_time: time,              
      status: row.alr_status,
      description: row.alr_description,
      is_use: row.alr_is_use,
      camera_id: row.alr_camera_id,
      footage_id: row.alr_footage_id,
      event_id: row.alr_event_id,
    };
  };

export const mapRowToAlertItemDelete = (row: any): Model.AlertSafeDelete => ({
    id: row.alr_id,
    is_use: row.alr_is_use,
});

export const mapRowToLogItem = (row: any): Model.LogItem => {

    const { date, time } = splitDateTime(row.loa_create_date);

    return {
        id: row.loa_id,
        event_name: row.loa_event_name,
        create_date: date,
        create_time: time,
        user_id: row.loa_user_id,
    }
};

export const mapRowToNoteItem = (row: any): Model.NoteItem => {

    const { date, time } = splitDateTime(row.anh_update_date);

    return {
        id: row.anh_id,
        note: row.anh_note,
        update_date: date,
        update_time: time,
        user_id: row.anh_user_id,
    }
};

export const mapRowToTrendItem = (row: any): Model.TrendAlertItem => ({
    severity: row.alr_severity,
    count: Number(row.count),
});