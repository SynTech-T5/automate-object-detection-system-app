export interface Alert {
    alr_id: number;
    alr_severity: string;
    alr_create_date: Date;
    alr_status: string;
    alr_is_use: boolean;
    alr_description: string;
    alr_camera: {
        cam_id: number;
        cam_name: string;
        cam_address: string;
        cam_type: string;
        cam_resolution: string;
        cam_description: string;
        cam_status: boolean;
        cam_installation_date: Date;
        cam_health: string;
        cam_video_quality: string;
        cam_network_latency: number;
        cam_is_use: boolean;
        cam_location_id: number;
    };
    alr_footage: {
        fgt_id: number;
        fgt_url: string;
        fgt_start_ts: Date;
        fgt_end_ts: Date;
    };
    alr_event: {
        evt_id: number;
        evt_icon: string;
        evt_name: string;
        evt_description: string;
        evt_is_use: boolean;
    };
}

export interface InsertAlert {
    alr_severity: string;
    alr_create_date: Date;
    alr_status: string;
    alr_description: string;
    alr_camera_id: number;
    alr_footage_id: number;
    alr_event_id: number;
} 

export function mapToAlert(row: any): Alert {
    return {
        alr_id: row.alr_id,
        alr_severity: row.alr_severity,
        alr_create_date: new Date(row.alr_create_date),
        alr_status: row.alr_status,
        alr_is_use: row.alr_is_use,
        alr_description: row.alr_description,

        alr_camera: {
            cam_id: row.cam_id,
            cam_name: row.cam_name,
            cam_address: row.cam_address,
            cam_type: row.cam_type,
            cam_resolution: row.cam_resolution,
            cam_description: row.cam_description,
            cam_status: row.cam_status,
            cam_installation_date: new Date(row.cam_installation_date),
            cam_health: row.cam_health,
            cam_video_quality: row.cam_video_quality,
            cam_network_latency: row.cam_network_latency,
            cam_is_use: row.cam_is_use,
            cam_location_id: row.cam_location_id,
        },

        alr_footage: {
            fgt_id: row.fgt_id,
            fgt_url: row.fgt_url,
            fgt_start_ts: new Date(row.fgt_start_ts),
            fgt_end_ts: new Date(row.fgt_end_ts),
        },

        alr_event: {
            evt_id: row.evt_id,
            evt_icon: row.evt_icon,
            evt_name: row.evt_name,
            evt_description: row.evt_description,
            evt_is_use: row.evt_is_use,
        },
    };
}
