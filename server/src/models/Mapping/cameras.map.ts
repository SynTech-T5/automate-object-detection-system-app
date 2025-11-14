import * as Model from "../cameras.model"
import { splitDateTime } from "./timeDate.map"

export function mapCameraToSaveResponse(row: any): Model.ResponsePostCamera {

    const createdAt = splitDateTime(row.cam_created_at);
    const updatedAt = splitDateTime(row.cam_updated_at);

    return {
        camera_id: row.cam_id,
        creator_id: row.cam_created_by,
        location_id: row.cam_loc_id ?? null,
        camera_name: row.cam_name,
        source_type: row.cam_source_type,
        source_value: row.cam_source_value,
        camera_type: row.cam_type,
        camera_status: row.cam_status,
        camera_description: row.cam_description ?? null,
        camera_created_date: createdAt.date,
        camera_created_time: createdAt.time,
        camera_updated_date: updatedAt.date,
        camera_updated_time: updatedAt.time,
        camera_is_use: row.cam_is_use
    };
}

export function mapEventDetectionToSaveResponse(row: any): Model.ResponseEventDetection {

    const updatedAt = splitDateTime(row.cds_updated_at);

    return {
        detection_id: row.cds_id,
        detection_event_id: row.cds_evt_id,
        event_name: row.evt_name,
        event_icon: row.evt_icon,
        camera_id: row.cds_cam_id,
        detection_sensitivity: row.cds_sensitivity,
        detection_priority: row.cds_priority,
        detection_updated_date: updatedAt.date,
        detection_updated_time: updatedAt.time,
        detection_status: row.cds_status
    };
}

export function mapMaintenanceToSaveResponse(row: any): Model.ResponseMaintenance {

    const maintenanceAt = splitDateTime(row.mnt_date);
    const createAt = splitDateTime(row.mnt_created_at);

    return {
        maintenance_id: row.mnt_id,
        camera_id: row.mnt_cam_id,
        maintenance_date: maintenanceAt.date,
        maintenance_type: row.mnt_type,
        maintenance_technician: row.mnt_technician,
        maintenance_note: row.mnt_note,
        maintenance_created_date: createAt.date,
        maintenance_created_time: createAt.time
    }
}

export function mapPermissionToSaveResponse(row: any): Model.ResponsePermission {

    const updateAt = splitDateTime(row.cap_updated_at);

    return {
        permission_id: row.cap_id,
        camera_id: row.cap_cam_id,
        permission_require_auth: row.cap_require_auth,
        permission_restrict: row.cap_restrict,
        permission_log: row.cap_log,
        permission_updated_date: updateAt.date,
        permission_updated_time: updateAt.time
    }
}