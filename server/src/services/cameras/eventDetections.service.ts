import { pool } from '../../config/db';
import * as Mapping from '../../models/Mapping/cameras.map';

/**
 * ดึงข้อมูลการตั้งค่าการตรวจจับเหตุการณ์ (Event Detection) ของกล้องตามรหัสที่ระบุ
 * ใช้สำหรับดูการตั้งค่าแต่ละเหตุการณ์ เช่น ความไว (sensitivity), ลำดับความสำคัญ (priority) และสถานะการทำงานของเหตุการณ์
 * 
 * @param {number} camera_id - รหัสของกล้องที่ต้องการดึงข้อมูลการตั้งค่าการตรวจจับเหตุการณ์
 * @returns {Promise<Model.EventDetection[]>} รายการการตั้งค่าการตรวจจับเหตุการณ์ของกล้องที่ระบุ
 * @throws {Error} ถ้าเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-12
 */
export async function getEventDetectionById(camera_id: number){
    const { rows } = await pool.query(`
        SELECT
            cds_id,
            cds_evt_id,
            evt_name,
            evt_icon,
            cds_cam_id,
            cds_sensitivity, 
            cds_priority,
            cds_updated_at,
            cds_status
        FROM camera_detection_settings
        JOIN events ON cds_evt_id = evt_id
        WHERE
            cds_cam_id = $1
        AND
            cds_is_use = true;
    `,[
        camera_id
    ]);

    return rows.map(Mapping.mapEventDetectionToSaveResponse);
}

/**
 * อัปเดตการตั้งค่าการตรวจจับเหตุการณ์ (Event Detection) ตามรหัสที่ระบุ
 * ใช้สำหรับปรับความไวในการตรวจจับ (sensitivity), ระดับความสำคัญ (priority) และสถานะการทำงานของเหตุการณ์
 * 
 * @param {string} detection_sensitivity - ค่าความไวในการตรวจจับเหตุการณ์ (เช่น critical, high, medium, low)
 * @param {string} detection_priority - ระดับความสำคัญของเหตุการณ์
 * @param {boolean} detection_status - สถานะการทำงานของการตรวจจับ (true = เปิดใช้งาน, false = ปิดใช้งาน)
 * @param {number} detection_id - รหัสของรายการตั้งค่าการตรวจจับเหตุการณ์ที่ต้องการอัปเดต
 * @returns {Promise<Model.EventDetection>} ข้อมูลของการตั้งค่าการตรวจจับเหตุการณ์ที่ถูกอัปเดต
 * @throws {Error} ถ้าไม่พบรายการที่ต้องการอัปเดตหรือเกิดข้อผิดพลาดระหว่างการอัปเดตฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-12
 */
export async function updateEventDetection(
    detection_sensitivity: string, 
    detection_priority: string, 
    detection_status: boolean, 
    detection_id: number
){
    const { rows } = await pool.query(`
        UPDATE camera_detection_settings
        SET
            cds_sensitivity = $1, 
            cds_priority = $2,
            cds_updated_at = CURRENT_TIMESTAMP,
            cds_status = $3
        WHERE
            cds_id = $4
        AND
            cds_is_use = true
        RETURNING *;
    `,[
        detection_sensitivity,
        detection_priority,
        detection_status,
        detection_id
    ]);

    return Mapping.mapEventDetectionToSaveResponse(rows[0]);
}