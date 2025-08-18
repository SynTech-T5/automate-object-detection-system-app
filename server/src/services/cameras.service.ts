import { pool } from '../config/db';

/**
 * ดึงรายการกล้องทั้งหมดจากฐานข้อมูล
 *
 * @returns {Promise<any[]>} รายการกล้องทั้งหมด
 * 
 * @author Wanasart
 */
export async function listCameras() {
    const result = await pool.query(
        "SELECT * FROM cameras"
    );
    return result.rows;
}

/**
 * นับจำนวนกล้องทั้งหมดที่ใช้งานอยู่
 *
 * @returns {Promise<any[]>} จำนวนกล้องที่ใช้งานอยู่ทั้งหมด
 * 
 * @author Premsirigul
 */
export async function totalCameras() {
    const result = await pool.query(
        "SELECT COUNT(*) FROM cameras WHERE cam_is_use = true"
    );
    return result.rows;
}

/**
 * ดึงรายการประวัติการซ่อมบำรุงกล้องทั้งหมด
 *
 * @returns {Promise<any[]>} รายการประวัติการซ่อมบำรุงกล้องทั้งหมด
 * @description ดึงข้อมูลประวัติการซ่อมบำรุงจากฐานข้อมูลโดยเรียงตามวันที่จากใหม่ไปเก่า
*
 * @author Jirayu
 */
export async function getAllMaintenanceHistory(): Promise<any[]> {
    const query = `
        SELECT 
            mnt_date,
            mnt_type,
            mnt_technician,
            mnt_note
        FROM maintenance_history 
        WHERE mnt_is_use = true
        ORDER BY mnt_date DESC
    `;

    const { rows } = await pool.query(query);
    return rows;
}

/**
 * ดึงรายการประวัติการซ่อมบำรุงตามรหัสกล้อง
 *
 * @param {number} cam_id - รหัสกล้องที่ต้องการดูประวัติการซ่อมบำรุง
 * @returns {Promise<any[]>} รายการประวัติการซ่อมบำรุงของกล้องที่ระบุ
 * @description ดึงข้อมูลประวัติการซ่อมบำรุงจากฐานข้อมูลตามรหัสกล้อง
 * 
 * @author Jirayu
 */
export async function getMaintenanceHistoryByCamId(cam_id: number): Promise<any[]> {
    const query = `
        SELECT 
            mnt_date,
            mnt_type,
            mnt_technician,
            mnt_note
        FROM maintenance_history 
        WHERE mnt_camera_id = $1 
        AND mnt_is_use = true
        ORDER BY mnt_date DESC
    `;



    const result = await pool.query(query,[cam_id]);

    return result.rows;
}

/**
 * เพิ่มข้อมูลของ Maintenance History
 *
 * ฟังก์ชันนี้จะเพิ่มวันที่, ประเภท, ชื่อของช่างซ่อม และคำอธิบายของ Maintenance History ในฐานข้อมูล
 * หากเพิ่มไม่สำเร็จ จะโยน Error
 *
 * @param {number} camId - ID ของกล้องที่ซ่อม
 * @param {Date} date - วันที่ที่เพิ่มข้อมูล
 * @param {string} type - ประเภทของการซ่อม
 * @param {string} technician - ชื่อของช่างที่ซ่อม
 * @param {string} note - คำอธิบายของ Maintenance History
 * @returns {Promise<object>} Maintenance History object หลังเพิ่มสำเร็จ
 * @throws {Error} เมื่อเพิ่ม Maintenance History ไม่สำเร็จ
 *
 * 
 * @author Napat
 */
export async function createMaintenanceHistory(camId: number, date: Date, type: string, technician: string, note: string) {
    const { rows } = await pool.query(`
        INSERT INTO maintenance_history(mnt_date, mnt_type, mnt_technician, mnt_note, mnt_camera_id)
	    VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `, [date, type, technician, note, camId]);

    const maintenanceHistory = rows[0];

    if (!maintenanceHistory) {
        throw new Error('Failed to insert Maintenance History');
    }

    return maintenanceHistory;
}

/**
 * เปลี่ยนสถานะของกล้อง
 *
 * @param {string} cam_id - ไอดีของ cam ที่จะเปลี่ยนสถานะ
 * @param {string} cam_status - สถานะที่จะเปลี่ยน
 * @returns {Promise<any[]>} กล้องที่ถูกอัปเดต
 * 
 * @author Audomsak
 * 
 */
export async function changeStatus(cam_id: number, cam_status: boolean) {
    const result = await pool.query(
        "UPDATE cameras SET cam_status = $1 WHERE cam_id = $2 RETURNING *",
        [cam_status, cam_id]
    );
    return result.rows[0]; // คืนค่ากล้องที่ถูกอัพเดต
}

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
 * อัปเดตข้อมูล Event Detection 
 * 
 * @param {number} cds_id - รหัสของ camera_detection_settings
 * @param {string} cds_sensitivity - ค่า sensitivity ใหม่ (High, Medium, Low)
 * @param {string} cds_priority - ค่า priority ใหม่ (High, Medium, Low)
 * @param {boolean} cds_status - สถานะใหม่ (true/false)
 * @returns {Promise<object>} Event Detection หลังอัปเดต
 * 
 * @author Wongsakon
 */
export async function updateEventDetection(cds_id: number, cds_sensitivity: string, cds_priority: string, cds_status: boolean) {
    const { rows } = await pool.query(
      `
      UPDATE camera_detection_settings
      SET cds_sensitivity = $1,
          cds_priority = $2,
          cds_status = $3
      WHERE cds_id = $4 
      RETURNING *;
      `,
      [cds_sensitivity, cds_priority, cds_status, cds_id]);
  
    const detection = rows[0];
  
    if (!detection) {
      throw new Error("Failed to update detection or not found");
    }
  
    return detection;
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

/**
 * ดึงรายการ Event Detection ทั้งหมด
 *
 * @returns {Promise<EventDetection[]>} รายการ Event Detection ที่ถูกใช้งานอยู่ทั้งหมด
 * @description ดึงข้อมูล Event Detection จากฐานข้อมูลโดยเรียงตาม cds_id จากมากไปน้อย และแสดงเฉพาะ Event Detection ที่ยังใช้งานอยู่
 *
 * @author Audomsak
 */
export async function deleteEventDetection(cds_id: number, cds_is_use: boolean) {
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