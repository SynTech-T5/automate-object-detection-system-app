import * as Model from "../cameras.model"
import { splitDateTime } from "./timeDate.map"

export function mapToCamera(row: any): Model.Camera {

    const { date, time } = splitDateTime(row.cam_installation_date);

    return {
        id: row.cam_id,
        name: row.cam_name,
        address: row.cam_address,
        type: row.cam_type,
        resolution: row.cam_resolution,
        description: row.cam_description,
        status: row.cam_status,
        installation_date: date,
        installation_time: time,
        health: Number(row.cam_health),
        video_quality: Number(row.cam_video_quality),
        network_latency: row.cam_network_latency,
        is_use: row.cam_is_use,
        location: {
            id: row.loc_id,
            name: row.loc_name
        }
    };
}