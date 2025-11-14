import * as Model from "../../models/location.model";
import { splitDateTime } from "./timeDate.map"

export function mapLocationToSaveResponse(row: any): Model.ResponseLocation {

    const updatedAt = splitDateTime(row.loc_updated_at);

    return {
        location_id: row.loc_id,
        location_name: row.loc_name,
        location_updated_date: updatedAt.date,
        location_updated_time: updatedAt.time
    };
}