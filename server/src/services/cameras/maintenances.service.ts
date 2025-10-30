import { pool } from '../../config/db';
import * as Mapping from '../../models/Mapping/cameras.map';

/**
 * ดึงข้อมูลประวัติการบำรุงรักษาของกล้องตามรหัสที่ระบุ
 * ใช้สำหรับแสดงรายการบันทึกการซ่อมหรือบำรุงรักษาของกล้องแต่ละตัว
 * 
 * @param {number} camera_id - รหัสของกล้องที่ต้องการดูประวัติการบำรุงรักษา
 * @returns {Promise<Model.Maintenance[]>} รายการประวัติการบำรุงรักษาของกล้องที่ระบุ
 * @throws {Error} ถ้าเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-17
 */
export async function getMaintenanceByCameraId(camera_id: number){
    const { rows } = await pool.query(`
        SELECT 
            mnt_id, 
            mnt_cam_id, 
            mnt_date, 
            mnt_type, 
            mnt_technician, 
            mnt_note, 
            mnt_created_at
        FROM maintenance_history
        WHERE
            mnt_cam_id = $1
        AND
            mnt_is_use = true
        ORDER BY mnt_date DESC;
    `, [
        camera_id
    ]);

    return rows.map(Mapping.mapMaintenanceToSaveResponse);
}

/**
 * เพิ่มข้อมูลการบำรุงรักษาใหม่สำหรับกล้องที่ระบุ
 * ใช้สำหรับบันทึกการซ่อม การตรวจเช็ก หรือการบำรุงรักษาในแต่ละครั้ง
 * 
 * @param {number} camera_id - รหัสของกล้องที่ต้องการเพิ่มประวัติการบำรุงรักษา
 * @param {string} technician - ชื่อช่างเทคนิคที่ทำการบำรุงรักษา
 * @param {string} type - ประเภทของการบำรุงรักษา (เช่น ตรวจเช็ก, ซ่อมแซม, เปลี่ยนอะไหล่)
 * @param {string} date - วันที่ดำเนินการบำรุงรักษา (รูปแบบ YYYY-MM-DD)
 * @param {string} note - หมายเหตุเพิ่มเติมเกี่ยวกับการบำรุงรักษา
 * @returns {Promise<Model.Maintenance>} ข้อมูลของประวัติการบำรุงรักษาที่ถูกเพิ่มใหม่
 * @throws {Error} ถ้าเกิดข้อผิดพลาดระหว่างการเพิ่มข้อมูลลงฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-17
 */
export async function insertMaintenance(
    camera_id: number,
    technician: string,
    type: string,
    date: string,
    note: string
){

    const { rows } = await pool.query(`
        INSERT INTO maintenance_history(
            mnt_cam_id,
            mnt_technician,
            mnt_type,
            mnt_date,
            mnt_note
        )
        VALUES($1, $2, $3, $4, $5)
        RETURNING *;
    `, [
        camera_id,
        technician,
        type,
        date,
        note
    ]);

    return Mapping.mapMaintenanceToSaveResponse(rows[0]);
}

/**
 * อัปเดตข้อมูลการบำรุงรักษาตามรหัสที่ระบุ
 * ใช้สำหรับแก้ไขรายละเอียดการบำรุงรักษา เช่น วันที่ ประเภท ช่างเทคนิค หรือหมายเหตุ
 * 
 * @param {number} maintenance_id - รหัสของรายการบำรุงรักษาที่ต้องการอัปเดต
 * @param {string} technician - ชื่อช่างเทคนิคที่ทำการบำรุงรักษา
 * @param {string} type - ประเภทของการบำรุงรักษา (เช่น ตรวจเช็ก, ซ่อมแซม, เปลี่ยนอะไหล่)
 * @param {string} date - วันที่ดำเนินการบำรุงรักษา (รูปแบบ YYYY-MM-DD)
 * @param {string} note - หมายเหตุเพิ่มเติมเกี่ยวกับการบำรุงรักษา
 * @returns {Promise<Model.Maintenance>} ข้อมูลของรายการบำรุงรักษาที่ถูกอัปเดต
 * @throws {Error} ถ้าไม่พบรายการที่ต้องการอัปเดต หรือเกิดข้อผิดพลาดระหว่างการอัปเดตฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-17
 */
export async function updateMaintenance(
    maintenance_id: number,
    technician: string,
    type: string,
    date: string,
    note: string
){

    const { rows } = await pool.query(`
        UPDATE
            maintenance_history
        SET
            mnt_technician = $2,
            mnt_type = $3,
            mnt_date = $4,
            mnt_note = $5,
            mnt_updated_at = CURRENT_TIMESTAMP
        WHERE
            mnt_id = $1
        RETURNING *;
    `, [
        maintenance_id,
        technician,
        type,
        date,
        note
    ]);

    return Mapping.mapMaintenanceToSaveResponse(rows[0]);
}

/**
 * ลบข้อมูลประวัติการบำรุงรักษาแบบ Soft Delete
 * โดยจะตั้งค่า mnt_is_use เป็น false และอัปเดตเวลาการแก้ไขล่าสุด
 * 
 * @param {number} maintenance_id - รหัสของรายการบำรุงรักษาที่ต้องการลบ
 * @returns {Promise<Model.Maintenance>} ข้อมูลของรายการบำรุงรักษาที่ถูกลบ (soft delete)
 * @throws {Error} ถ้าไม่พบรายการที่ต้องการลบ หรือเกิดข้อผิดพลาดระหว่างการอัปเดตฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-17
 */
export async function removeMaintenance(maintenance_id: number){

    const { rows } = await pool.query(`
        UPDATE maintenance_history
        SET
            mnt_is_use = false,
            mnt_updated_at = CURRENT_TIMESTAMP
        WHERE
            mnt_id = $1
        RETURNING *;    
    `, [
        maintenance_id
    ]);

    return Mapping.mapMaintenanceToSaveResponse(rows[0]);
}