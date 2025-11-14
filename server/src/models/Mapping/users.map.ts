import * as Model from "../users.model";
import { splitDateTime } from "./timeDate.map";

export function mapUserToSaveResponse(row: any): Model.User {
    
  const createdAt = splitDateTime(row.usr_created_at);
  const updatedAt = splitDateTime(row.usr_created_at);

  return {
    id: row.usr_id,
    role_id: row.usr_rol_id,
    username: row.usr_username,
    email: row.usr_email,
    name: row.usr_name,
    phone: row.usr_phone,
    profile_url: row.usr_profile,
    created_at: createdAt.date + ' ' + createdAt.time,
    updated_at: updatedAt.date + ' ' + updatedAt.time,
    is_use: row.usr_is_use,
  };
}
