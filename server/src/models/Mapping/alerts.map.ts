import { Alert, AlertSafe, AlertSafeDelete, LogItem, NoteItem, TrendAlertItem } from "../alerts.model";
import { splitDateTime } from "./timeDate.map"

export function mapToAlert(row: any): Alert {

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
            location_id: row.cam_location_id,
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

export const mapRowToAlertItem = (row: any): AlertSafe => {
  
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

export const mapRowToAlertItemDelete = (row: any): AlertSafeDelete => ({
    id: row.alr_id,
    is_use: row.alr_is_use,
});

export const mapRowToLogItem = (row: any): LogItem => {

    const { date, time } = splitDateTime(row.loa_create_date);

    return {
        id: row.loa_id,
        event_name: row.loa_event_name,
        create_date: date,
        create_time: time,
        user_id: row.loa_user_id,
    }
};

export const mapRowToNoteItem = (row: any): NoteItem => {

    const { date, time } = splitDateTime(row.anh_update_date);

    return {
        id: row.anh_id,
        note: row.anh_note,
        update_date: date,
        update_time: time,
        user_id: row.anh_user_id,
    }
};

export const mapRowToTrendItem = (row: any): TrendAlertItem => ({
    severity: row.alr_severity,
    count: Number(row.count),
});