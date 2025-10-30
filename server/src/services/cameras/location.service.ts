import { pool } from '../../config/db';
import * as Model from '../../models/location.model';
import * as Mapping from '../../models/Mapping/location.map';

/**
 * ดึงข้อมูลสถานที่ทั้งหมดที่อยู่ในสถานะเปิดใช้งาน (Active)
 * ใช้สำหรับโหลดรายชื่อสถานที่ (locations) เพื่อแสดงผลในระบบ เช่น dropdown หรือหน้าแสดงข้อมูลกล้อง
 * 
 * @async
 * @function getLocation
 * @returns {Promise<Array<Model.Location>>} รายการข้อมูลสถานที่ที่ถูกเปิดใช้งาน
 * @throws {Error} หากเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-12
 */
export async function getLocation() {
    const { rows } = await pool.query(`
        SELECT
            loc_id,
            loc_name,
            loc_updated_at
        FROM locations
        WHERE
            loc_is_use = true;
    `);

    return rows.map(Mapping.mapLocationToSaveResponse);
}

export async function insertLocation(location_name: string) {
    return 0;
}

export async function updateLocation(location_id: number, location_name: string) {
    return 0;
}

export async function removeLocation(location_id: number) {
    return 0;
}