import { pool } from '../../config/db';
import * as Mapping from '../../models/Mapping/cameras.map';

/**
 * ดึงข้อมูลสิทธิ์การเข้าถึงของกล้องตามรหัสที่ระบุ
 * ใช้สำหรับตรวจสอบการตั้งค่าการเข้าถึง เช่น การยืนยันตัวตน การจำกัดสิทธิ์ และการบันทึกการเข้าถึง
 * 
 * @param {number} camera_id - รหัสของกล้องที่ต้องการดึงข้อมูลสิทธิ์การเข้าถึง
 * @returns {Promise<Model.CameraPermission[]>} รายการสิทธิ์การเข้าถึงของกล้องที่ระบุ
 * @throws {Error} ถ้าเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-17
 */
export async function getPermissionByCameraId(camera_id: number){

  const { rows } = await pool.query(`
    SELECT
      cap_id,
      cap_cam_id,
      cap_require_auth,
      cap_restrict,
      cap_log,
      cap_updated_at
    FROM
      camera_permissions
    WHERE
      cap_cam_id = $1
    AND
      cap_is_use = true;
  `, [
    camera_id
  ]);

  return rows.map(Mapping.mapPermissionToSaveResponse);
}

/**
 * อัปเดตสิทธิ์การเข้าถึงของกล้องตามรหัสที่ระบุ
 * ใช้สำหรับปรับค่าการตั้งค่า เช่น การบังคับยืนยันตัวตน การจำกัดบทบาทผู้ใช้ และการบันทึกการเข้าถึงกล้อง
 * 
 * @param {number} camera_id - รหัสของกล้องที่ต้องการอัปเดตสิทธิ์การเข้าถึง
 * @param {boolean} require_auth - ระบุว่าต้องมีการยืนยันตัวตนก่อนเข้าถึงหรือไม่
 * @param {boolean} restrict - ระบุว่าจำกัดสิทธิ์การเข้าถึงเฉพาะบทบาทบางประเภทหรือไม่
 * @param {boolean} log - ระบุว่าต้องการบันทึกการเข้าถึงของผู้ใช้หรือไม่
 * @returns {Promise<Model.CameraPermission>} ข้อมูลสิทธิ์การเข้าถึงของกล้องที่ถูกอัปเดต
 * @throws {Error} ถ้าไม่พบกล้องหรือเกิดข้อผิดพลาดระหว่างการอัปเดตฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-17
 */
export async function updatePermission(
  camera_id: number,
  require_auth: boolean,
  restrict: boolean,
  log: boolean
){

  const { rows } = await pool.query(`
    UPDATE
      camera_permissions
    SET
      cap_require_auth = $2,
      cap_restrict = $3,
      cap_log = $4,
      cap_updated_at = CURRENT_TIMESTAMP
    WHERE
      cap_cam_id = $1
    RETURNING *;
  `, [
    camera_id,
    require_auth,
    restrict,
    log
  ]);

  return Mapping.mapPermissionToSaveResponse(rows[0]);
}