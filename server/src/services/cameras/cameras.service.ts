import { pool } from '../../config/db';
import * as Model from '../../models/cameras.model';
import * as Mapping from '../../models/Mapping/cameras.map';

/**✅
 * ดึงรายการกล้องทั้งหมดจากมุมมอง (view) v_cameras_overview
 * ใช้สำหรับแสดงภาพรวมของกล้องทุกตัวในระบบ รวมถึงข้อมูลสถานะ ตำแหน่ง และแหล่งที่มา
 * 
 * @returns {Promise<Model.Camera[]>} รายการกล้องทั้งหมดในระบบ
 * @throws {Error} ถ้าเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-12
 */
export async function getCameras() {
  const { rows } = await pool.query(`
        SELECT * FROM v_cameras_overview;
    `);

  return rows;
}

export async function getCameraById(camera_id: number) {
  const { rows } = await pool.query(`
    SELECT * FROM v_cameras_overview
    WHERE camera_id = $1;
  `,[
      camera_id
    ]
  );

  return rows;
}

/**✅
 * ดึงข้อมูลสรุปภาพรวมของกล้องทั้งหมดจากมุมมอง (view) v_camera_summary
 * ใช้สำหรับแสดงข้อมูลเชิงสถิติหรือสรุปสถานะกล้อง เช่น จำนวนกล้องที่เปิดใช้งาน ปิดใช้งาน และกล้องทั้งหมดในระบบ
 * 
 * @returns {Promise<any[]>} ข้อมูลสรุปของกล้องทั้งหมดในระบบ
 * @throws {Error} ถ้าเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-12
 */
export async function summaryCameras() {
  const { rows } = await pool.query(`
        SELECT * FROM v_camera_summary;
    `);

  return rows;
}

/**✅
 * เพิ่มข้อมูลกล้องใหม่เข้าสู่ฐานข้อมูล
 * @param {string} camera_name - ชื่อของกล้อง
 * @param {string} camera_type - ประเภทของกล้อง (เช่น fixed, dome, ptz)
 * @param {boolean} camera_status - สถานะการใช้งานของกล้อง (true = เปิดใช้งาน, false = ปิดใช้งาน)
 * @param {string} source_type - ประเภทของแหล่งข้อมูลวิดีโอ (เช่น url, file, stream)
 * @param {string} source_value - ค่าหรือที่อยู่ของแหล่งข้อมูลวิดีโอ เช่น URL หรือ path
 * @param {number} location_id - รหัสสถานที่ตั้งของกล้อง
 * @param {string} description - รายละเอียดเพิ่มเติมเกี่ยวกับกล้อง
 * @param {number} creator_id - รหัสผู้ใช้ที่สร้างรายการกล้องนี้
 * @returns {Promise<any>} ข้อมูลของกล้องที่ถูกเพิ่ม (record ที่ถูก INSERT)
 * @throws {Error} ถ้าเกิดข้อผิดพลาดระหว่างการบันทึกข้อมูลลงฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-25
 */
export async function insertCamera (
  camera_name: string, 
  camera_type: string, 
  camera_status: boolean, 
  source_type: string, 
  source_value: string, 
  location_id: number, 
  description: string, 
  creator_id: number
){
  const { rows } = await pool.query(`
    INSERT INTO cameras(
      cam_name, 
      cam_type,
      cam_status,
      cam_source_type,
      cam_source_value,
      cam_loc_id,
      cam_description,
      cam_created_by
    )
    VALUES($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `,[
      camera_name, 
      camera_type, 
      camera_status, 
      source_type, 
      source_value, 
      location_id, 
      description, 
      creator_id
    ]);

    const log = await pool.query(`
      INSERT INTO camera_logs(
        clg_usr_id,
        clg_cam_id,
        clg_action,
        clg_created_at
      )
      VALUES($1, $2, $3, CURRENT_TIMESTAMP);
    `,[
        creator_id,
        rows[0].cam_id,
        'CREATE',
      ]);

  return Mapping.mapCameraToSaveResponse(rows[0]);
}

/**✅
 * อัปเดตข้อมูลกล้องในระบบตามรหัสที่ระบุ
 * โดยจะปรับปรุงข้อมูลรายละเอียดกล้อง เช่น ชื่อ ประเภท สถานะ แหล่งข้อมูล และคำอธิบาย
 * พร้อมอัปเดตเวลาการแก้ไขล่าสุด (cam_updated_at)
 * 
 * @param {number} camera_id - รหัสของกล้องที่ต้องการอัปเดต
 * @param {string} camera_name - ชื่อของกล้อง
 * @param {string} camera_type - ประเภทของกล้อง (เช่น fixed, dome, ptz)
 * @param {boolean} camera_status - สถานะของกล้อง (true = เปิดใช้งาน, false = ปิดใช้งาน)
 * @param {string} source_type - ประเภทของแหล่งข้อมูลวิดีโอ (เช่น url, file, stream)
 * @param {string} source_value - ค่าหรือที่อยู่ของแหล่งข้อมูลวิดีโอ เช่น URL หรือ path
 * @param {number} location_id - รหัสสถานที่ตั้งของกล้อง
 * @param {string} description - รายละเอียดเพิ่มเติมเกี่ยวกับกล้อง
 * @returns {Promise<Model.ResponsePostCamera>} ข้อมูลของกล้องที่ถูกอัปเดตหลังจากบันทึกสำเร็จ
 * @throws {Error} ถ้าไม่พบกล้องที่ต้องการอัปเดต หรือเกิดข้อผิดพลาดระหว่างการอัปเดตฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-25
 */
export async function updateCamera (
  camera_id: number,
  camera_name: string,
  camera_type: string,
  camera_status: boolean,
  source_type: string,
  source_value: string,
  location_id: number,
  description: string,
  user_id: number
) {

  const { rows } = await pool.query(
    `
    UPDATE cameras
    SET
      cam_name = $1,
      cam_type = $2,
      cam_status = $3,
      cam_source_type = $4,
      cam_source_value = $5,
      cam_loc_id = $6,
      cam_description = $7,
      cam_updated_at = CURRENT_TIMESTAMP
    WHERE cam_id = $8
    RETURNING *;
    `,
    [
      camera_name,
      camera_type,
      camera_status,
      source_type,
      source_value,
      location_id,
      description,
      camera_id,
    ]
  );

  const log = await pool.query(`
      INSERT INTO camera_logs(
        clg_usr_id,
        clg_cam_id,
        clg_action,
        clg_created_at
      )
      VALUES($1, $2, $3, CURRENT_TIMESTAMP);
    `,[
        user_id,
        rows[0].cam_id,
        'UPDATE',
      ]);

  return Mapping.mapCameraToSaveResponse(rows[0]);
}

/**✅
 * ลบข้อมูลกล้องแบบ Soft Delete (ไม่ลบออกจากฐานข้อมูลจริง)
 * โดยจะเปลี่ยนค่า cam_is_use เป็น false และอัปเดตเวลาแก้ไขล่าสุด
 * 
 * @param {number} camera_id - รหัสของกล้องที่ต้องการลบ
 * @returns {Promise<Model.ResponsePostCamera>} ข้อมูลของกล้องที่ถูกอัปเดตหลังจากลบ (soft delete)
 * @throws {Error} ถ้าไม่พบกล้องที่ต้องการลบ หรือเกิดข้อผิดพลาดระหว่างการอัปเดตฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-12
 */
export async function removeCamera(camera_id: number) { //ลบข้อมูลกล้องแบบ soft delete
  const { rows } = await pool.query(
    `
    UPDATE cameras
    SET
      cam_is_use = false,
      cam_updated_at = CURRENT_TIMESTAMP
    WHERE cam_id = $1
    RETURNING *;
    `,
    [
      camera_id
    ]
  );

  return Mapping.mapCameraToSaveResponse(rows[0]);
}