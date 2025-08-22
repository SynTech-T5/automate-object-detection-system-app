import { pool } from '../../config/db';

/**
 * ดึงรายการ Event Detection จากฐานข้อมูล
 *
 * @returns {Promise<any[]>} รายการ Event Detection
 * (icon, name, sensitivity, priority, status)
 * @description
 * ฟังก์ชันนี้จะ query join ข้อมูลระหว่าง events กับ camera_detection_settings
 * โดยใช้ evt_id = cds_event_id เพื่อดึงรายละเอียดที่จำเป็นสำหรับการแสดงผล
 * 
 * @author Wongsakon
 */
export async function eventDetection() {
    const result = await pool.query(
        "SELECT evt_id, evt_icon, evt_name, cds_sensitivity, cds_priority, cds_status FROM events INNER JOIN camera_detection_settings ON evt_id = cds_event_id"
    );
    return result.rows;
}

/**
 * เพิ่มข้อมูลของ EventDetection
 *
 * @param {number} cds_event_id - รหัสของ Event 
 * @param {number} cds_camera_id - รหัสของ Camera
 * @param {string} cds_sensitivity - ความไวในการตรวจจับ
 * @param {string} cds_priority - ความสำคัญของ Eventdetection
 * @param {string} cds_status - สถานะของ Eventdetection
 * @returns {Promise<object>} EventDetection object หลังสร้างเสร็จ
 *
 * @author Audomsak
 */
export async function createEventDetection( cds_event_id: number,
    cds_camera_id: number,
    cds_sensitivity: string = "Medium",
    cds_priority: string = "Medium",
    cds_status: boolean = true
) {
    const { rows } = await pool.query(`
        INSERT INTO camera_detection_settings (cds_event_id, cds_camera_id, cds_sensitivity, cds_priority, cds_status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `, [cds_event_id, cds_camera_id, cds_sensitivity, cds_priority, cds_status]);

    const eventDetection = rows[0];

    if (!eventDetection) {
        throw new Error('Failed to insert Event Detection');
    }

    return eventDetection;
}

export async function updateEventDetection(cds_camera_id: number) {}

/**
 * ดึงรายการ Event Detection ทั้งหมด
 *
 * @returns {Promise<EventDetection[]>} รายการ Event Detection ที่ถูกใช้งานอยู่ทั้งหมด
 * @description ดึงข้อมูล Event Detection จากฐานข้อมูลโดยเรียงตาม cds_id จากมากไปน้อย และแสดงเฉพาะ Event Detection ที่ยังใช้งานอยู่
 *
 * @author Audomsak
 */
export async function softDeleteEventDetection(cds_id: number, cds_is_use: boolean) {
    const { rows } = await pool.query(`
        UPDATE camera_detection_settings
        set cds_is_use = $1
        WHERE cds_id = $2
        RETURNING *;
        `, [cds_is_use, cds_id]);

    const events = rows[0];

    if (!events) {
        throw new Error('Failed to delete EventDetection or EventDetection not found');
    }

    return events
}