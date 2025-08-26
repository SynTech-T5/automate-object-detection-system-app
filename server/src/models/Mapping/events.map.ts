import { splitDateTime } from "./timeDate.map"
import * as Model from "../../models/events.model"

export const mapToEvent = (row: any): Model.Events => {

    return {
        id: row.evt_id,
        icon: row.evt_icon,
        name: row.evt_name,
        description: row.evt_description,
        status: row.evt_status,
        is_use: row.evt_is_use
    }
};

export const mapToEventDelete = (row: any): Model.EventSafeDelete => {

    return {
        id: row.evt_id,
        is_use: row.evt_is_use
    }
};