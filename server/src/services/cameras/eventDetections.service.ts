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
export async function listEventDetections() {
    const result = await pool.query(`
        SELECT * FROM camera_detection_settings 
        INNER JOIN events ON evt_id = cds_event_id
    `);
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
 * @throws {Error} ถ้าไม่พบ camera,event หรือไม่สามารถอัปเดตได้
 * 
 * @author Audomsak
 */
export async function createEventDetection( cds_event_id: number,
    cds_camera_id: number
) {
    const cameraExists = await pool.query(`
        SELECT cam_id FROM cameras 
        WHERE cam_id = $1
        AND cam_is_use = true
    `, [cds_camera_id]);

    if (cameraExists.rows.length === 0) {
        throw new Error('Camera not found or Camera not in use');
    }

    const EventExists = await pool.query(`
        SELECT evt_id FROM events 
        WHERE evt_id = $1
        AND evt_is_use = true
    `, [cds_event_id]);

    if (EventExists.rows.length === 0) {
        throw new Error('Event not found or Event not in use');
    }

    const { rows } = await pool.query(`
        INSERT INTO camera_detection_settings (cds_event_id, cds_camera_id)
        VALUES ($1, $2)
        RETURNING *;
    `, [cds_event_id, cds_camera_id]);

    const eventDetection = rows[0];

    if (!eventDetection) {
        throw new Error('Failed to insert Event Detection');
    }

    return eventDetection;
}

/**
 * อัปเดตข้อมูลของ EventDetection
 *
 * @param {number} id - รหัสของ EventDetection ที่ต้องการอัปเดต
 * @param {number} event_id - รหัสของ Event 
 * @param {number} camera_id - รหัสของ Camera
 * @param {string} sensitivity - ความไวในการตรวจจับ
 * @param {string} priority - ความสำคัญของ Eventdetection
 * @param {boolean} status - สถานะของ Eventdetection
 * @returns {Promise<object>} EventDetection object หลังอัปเดตเสร็จ
 * @throws {Error} ถ้าไม่พบ camera,event หรือไม่สามารถอัปเดตได้
 * 
 * @author Wanasart
 */
export async function updateEventDetection(id: number, event_id: number, camera_id: number, sensitivity: string, priority: string, status: boolean ) {
    const { rows } = await pool.query(`
        UPDATE camera_detection_settings
        SET cds_event_id = $1,
            cds_camera_id = $2,
            cds_sensitivity = $3,
            cds_priority = $4,
            cds_status = $5
        WHERE cds_id = $6
        RETURNING *;
    `, [event_id, camera_id, sensitivity, priority, status, id]);

    const eventDetection = rows[0];

    if (!eventDetection) {
        throw new Error('Failed to update Event Detection or Event Detection not found');
    }

    return eventDetection;
}

/**
 * ลบ EventDetection ที่เลือก
 *
 * @returns {Promise<EventDetection[]>} รายการ Event Detection ที่ถูกใช้งานอยู่ทั้งหมด
 * @description ดึงข้อมูล Event Detection จากฐานข้อมูลโดยเรียงตาม cds_id จากมากไปน้อย และแสดงเฉพาะ Event Detection ที่ยังใช้งานอยู่
 * @throws {Error} ถ้าไม่พบ Event Detection หรือไม่สามารถอัปเดตได้
 * 
 * @author Audomsak
 */
export async function softDeleteEventDetection(cds_id: number, cds_is_use: boolean) {
const cameraExists = await pool.query(`
        SELECT cds_id FROM camera_detection_settings
        WHERE cds_id = $1
        AND cds_is_use = true
    `, [cds_id]);

    if (cameraExists.rows.length === 0) {
        throw new Error('EventDetection not found or EventDetection is delete');
    }

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