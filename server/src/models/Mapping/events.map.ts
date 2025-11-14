import * as Model from "../../models/events.model"
import { splitDateTime } from "./timeDate.map"

export const mapEventsToSaveResponse = (row: any): Model.Events => {

    const createdAt = splitDateTime(row.evt_created_at);
    const updatedAt = splitDateTime(row.evt_updated_at);

    return {
        event_id: row.evt_id,
        event_name: row.evt_name,
        icon_name: row.evt_icon,
        description: row.evt_description,
        created_at: createdAt.date + ' ' + createdAt.time,
        updated_at: updatedAt.date + ' ' + updatedAt.time,
        event_is_use: row.evt_is_use
    }
};

export const mapGlobalEventsToSaveResponse = (row: any): Model.GlobalEvents => {

    const updatedAt = splitDateTime(row.gds_updated_at);

    return {
        event_id: row.gds_id,
        event_name: row.gds_name,
        icon_name: row.gds_icon,
        description: row.gds_description,
        status: row.gds_status,
        sensitivity: row.gds_sensitivity,
        priority: row.gds_priority,
        updated_at: updatedAt.date + ' ' + updatedAt.time
    }
};