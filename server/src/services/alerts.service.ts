import { pool } from '../config/db';
import * as Model from '../models/alerts.model'
import * as Mapping from '../models/Mapping/alerts.map'

/**
 * ดึงรายการ Alerts ล่าสุดทั้งหมดจากมุมมอง v_alerts_overview
 * ใช้สำหรับหน้า List/Overview โดยเรียงจากรายการที่สร้างล่าสุดมาก่อน
 *
 * @returns {Promise<Array<any>>} รายการ Alert overview ทั้งหมดเรียงตาม created_at DESC
 * @throws {Error} หากเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-27
 */
export async function getAlerts() {
    const { rows } = await pool.query(`
        SELECT * FROM v_alerts_overview
        ORDER BY created_at DESC;
    `);

    return rows;
}

/**
 * ดึงรายละเอียด Alert รายการเดียวจาก v_alerts_overview ตามรหัสที่ระบุ
 * เหมาะสำหรับหน้า Alert Detail
 *
 * @param {number} alert_id - รหัส Alert ที่ต้องการค้นหา
 * @returns {Promise<any>} ข้อมูล Alert overview ของรายการที่พบ (หรือ undefined หากไม่พบ)
 * @throws {Error} หากเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-27
 */
export async function getAlertById(alert_id: number) {
    const { rows } = await pool.query(`
        SELECT * FROM v_alerts_overview
        WHERE alert_id = $1;
    `, [alert_id]);

    return rows[0];
}

/**
 * ดึงประวัติการทำรายการ (Logs) ของ Alert ตามรหัสที่ระบุ
 * รวมข้อมูลผู้ใช้งานและบทบาท เพื่อการติดตามการเปลี่ยนแปลง
 *
 * @param {number} alert_id - รหัส Alert ที่ต้องการดูประวัติการทำรายการ
 * @returns {Promise<Array<any>>} รายการ Log ที่ถูกแมปเป็นรูปแบบตอบกลับของระบบ
 * @throws {Error} หากเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-28
 */
export async function getAlertLogs(alert_id: number) {
    const { rows } = await pool.query(`
        SELECT
            alg_id, 
            alg_usr_id,
            usr_username,
            usr_name,
            rol_name,
            alg_alr_id, 
            alg_action, 
            alg_created_at
        FROM alert_logs
        JOIN users ON alg_usr_id = usr_id
        JOIN roles ON usr_rol_id = rol_id
        WHERE alg_alr_id = $1;
    `, [alert_id]);

    return rows.map(Mapping.mapLogsToSaveResponse);
}

/**
 * ดึงรายการ Alert ที่เกี่ยวข้อง (Related) โดยอ้างอิงจาก event_name ของ Alert เป้าหมาย
 * ใช้สำหรับแสดง Alert ที่เป็นเหตุการณ์ชนิดเดียวกัน เรียงตามเวลาที่สร้างล่าสุด
 *
 * @param {number} alert_id - รหัส Alert อ้างอิงเพื่อค้นหา event_name
 * @returns {Promise<Array<any>>} รายการ Alert ที่มี event_name เดียวกัน เรียงตาม created_at DESC
 * @throws {Error} หากไม่พบ event_name ของ Alert เป้าหมาย หรือเกิดข้อผิดพลาดระหว่างการดึงข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-28
 */
export async function getAlertRelated(alert_id: number) {
    const event_name_result = await pool.query(`
        SELECT event_name 
        FROM v_alerts_overview
        WHERE alert_id = $1;
    `, [alert_id]);

    const { rows } = await pool.query(`
        SELECT * FROM v_alerts_overview
        WHERE event_name = $1
        ORDER BY created_at DESC;
    `, [event_name_result.rows[0].event_name]);

    return rows;
}

/**
 * ดึงบันทึกข้อความ (Notes) ของ Alert ตามรหัสที่ระบุ
 * รวมผู้เขียนบันทึก บทบาท เวลาสร้าง/แก้ไข และคัดเฉพาะรายการที่ยังใช้งาน (anh_is_use = true)
 *
 * @param {number} alert_id - รหัส Alert ที่ต้องการดึงบันทึก
 * @returns {Promise<Array<any>>} รายการบันทึกที่ถูกแมปเป็นรูปแบบตอบกลับของระบบ
 * @throws {Error} หากเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-28
 */
export async function getAlertNotes(alert_id: number) {
    const { rows } = await pool.query(`
        SELECT
            anh_id, 
            anh_usr_id,
            usr_username,
            usr_name,
            rol_name,
            anh_alr_id, 
            anh_note, 
            anh_created_at, 
            anh_updated_at
        FROM alert_note_history
        JOIN users ON anh_usr_id = usr_id
        JOIN roles ON usr_rol_id = rol_id
        WHERE anh_alr_id = $1
        AND anh_is_use = true
        ORDER BY anh_created_at DESC;
    `, [alert_id]);

    return rows.map(Mapping.mapNotesToSaveResponse);
}

/**
 * ดึงรายการกล้องที่มีการเกิด Alert ภายใน 24 ชั่วโมงล่าสุด
 * อ้างอิงจากมุมมอง v_cameras_latest_alert
 *
 * @returns {Promise<Array<any>>} รายการกล้องพร้อมเวลาที่เกิด Alert ล่าสุดภายในช่วงเวลา 24 ชั่วโมง
 * @throws {Error} หากเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-29
 */
export async function getRecentCameraAlert() {
    const { rows } = await pool.query(`
        SELECT * FROM v_cameras_latest_alert
        WHERE last_alert_at >= NOW() - INTERVAL '24 hours';
    `);

    return rows;
}

/**
 * เพิ่มบันทึกข้อความ (Note) ให้กับ Alert ที่ระบุ
 * ระบบจะกำหนดเวลาสร้างและแก้ไขล่าสุดเป็นเวลาปัจจุบันอัตโนมัติ
 *
 * @param {number} user_id - รหัสผู้ใช้งานที่ทำการบันทึกข้อความ
 * @param {number} alert_id - รหัส Alert ที่ต้องการเพิ่มบันทึก
 * @param {string} note - เนื้อหาบันทึกข้อความ
 * @returns {Promise<any>} บันทึกข้อความที่ถูกสร้างใหม่หลังจากแมปเป็นรูปแบบตอบกลับของระบบ
 * @throws {Error} หากไม่สามารถเพิ่มบันทึกได้หรือเกิดข้อผิดพลาดในฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-28
 */
export async function insertAlertNote(
    user_id: number, 
    alert_id: number, 
    note: string
){
    const { rows } = await pool.query(`
        INSERT INTO alert_note_history(
            anh_usr_id,
            anh_alr_id,
            anh_note,
            anh_created_at,
            anh_updated_at
        ) VALUES($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *;
    `, [user_id, alert_id, note]);

    return Mapping.mapNotesToSaveResponse(rows[0]);
}

/**
 * แก้ไขบันทึกข้อความ (Note) ของ Alert ตามรหัสบันทึกที่ระบุ
 * ระบบจะอัปเดตเวลาแก้ไขล่าสุดเป็นเวลาปัจจุบันอัตโนมัติ
 *
 * @param {number} user_id - รหัสผู้ใช้งานที่ทำการแก้ไขบันทึก (เพื่อบันทึกประวัติ/ตรวจสอบ)
 * @param {number} note_id - รหัสบันทึกข้อความที่ต้องการแก้ไข
 * @param {string} note - เนื้อหาบันทึกข้อความฉบับแก้ไข
 * @returns {Promise<any>} บันทึกข้อความที่ถูกแก้ไขหลังจากแมปเป็นรูปแบบตอบกลับของระบบ
 * @throws {Error} หากไม่พบบันทึกที่ต้องการแก้ไขหรือเกิดข้อผิดพลาดในฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-28
 */
export async function updateAlertNote(
    user_id: number,
    note_id: number, 
    note: string
){
    const { rows } = await pool.query(`
        UPDATE alert_note_history
        SET 
            anh_note = $1,
            anh_updated_at = CURRENT_TIMESTAMP
        WHERE anh_id = $2
        RETURNING *;
    `, [note, note_id]);

    return Mapping.mapNotesToSaveResponse(rows[0]);
}

/**
 * ลบบันทึกข้อความ (Note) แบบ Soft Delete โดยตั้งค่า anh_is_use = false
 * เหมาะสำหรับซ่อนบันทึกออกจากมุมมองโดยไม่ลบข้อมูลจริง
 *
 * @param {number} note_id - รหัสบันทึกข้อความที่ต้องการลบ (ปิดการใช้งาน)
 * @returns {Promise<any>} บันทึกที่ถูกปิดการใช้งานหลังจากแมปเป็นรูปแบบตอบกลับของระบบ
 * @throws {Error} หากไม่พบบันทึกที่ต้องการลบหรือเกิดข้อผิดพลาดในฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-28
 */
export async function removeAlertNote(
    note_id: number
){
    const { rows } = await pool.query(`
        UPDATE alert_note_history
        SET
            anh_is_use = false,
            anh_updated_at = CURRENT_TIMESTAMP
        WHERE anh_id = $1
        RETURNING *;
    `, [note_id]);

    return Mapping.mapNotesToSaveResponse(rows[0]);
}


/**
 * สร้าง Alert ใหม่พร้อมบันทึก Log การสร้าง
 * รองรับการอ้างอิงผู้สร้าง กล้อง ไฟล์ฟุตเทจ และเหตุการณ์ พร้อมระบุความรุนแรงและคำอธิบาย
 *
 * @param {number} user_id - รหัสผู้ใช้งานผู้สร้าง Alert
 * @param {number} camera_id - รหัสกล้องที่เกี่ยวข้อง
 * @param {number} footage_id - รหัสฟุตเทจที่เกี่ยวข้อง
 * @param {number} event_id - รหัสเหตุการณ์ (event) ที่ตรวจจับได้
 * @param {string} severity - ระดับความรุนแรงของ Alert (เช่น critical, high, medium, low)
 * @param {string} description - คำอธิบาย/รายละเอียดเพิ่มเติมของ Alert
 * @returns {Promise<any>} ข้อมูล Alert ที่ถูกสร้างหลังจากแมปเป็นรูปแบบตอบกลับของระบบ
 * @throws {Error} หากไม่สามารถสร้าง Alert ได้หรือเกิดข้อผิดพลาดในฐานข้อมูล/การบันทึก Log
 *
 * @author Wanasart
 * @lastModified 2025-10-27
 */
export async function insertAlert(
    user_id: number, 
    camera_id: number, 
    footage_id: number, 
    event_id: number, 
    severity: string, 
    description: string
) {
    const { rows } = await pool.query(`
        INSERT INTO alerts(
            alr_created_by, 
            alr_cam_id, 
            alr_fgt_id, 
            alr_evt_id, 
            alr_severity, 
            alr_description
        ) VALUES($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `,[
        user_id, 
        camera_id, 
        footage_id, 
        event_id, 
        severity, 
        description
    ]);

    const log = await pool.query(`
      INSERT INTO alert_logs(
        alg_usr_id, 
        alg_alr_id, 
        alg_action, 
        alg_created_at
      )
      VALUES($1, $2, $3, CURRENT_TIMESTAMP);
    `,[
        user_id,
        rows[0].alr_id,
        'CREATE_ALERT',
      ]);

    return Mapping.mapAlertToSaveResponse(rows[0]);
}

/**
 * อัปเดตสถานะ (status) และสาเหตุ (reason) ของ Alert พร้อมบันทึก Log การเปลี่ยนแปลง
 * ใช้สำหรับเปลี่ยนสถานะเป็น resolved/dismissed/อื่น ๆ ตามธุรกิจ และบันทึกเหตุผลประกอบ
 *
 * @param {number} alert_id - รหัส Alert ที่ต้องการอัปเดต
 * @param {string} status - สถานะใหม่ของ Alert (เช่น resolved, dismissed, active)
 * @param {string} reason - เหตุผลหรือคำอธิบายประกอบการเปลี่ยนสถานะ
 * @param {number} user_id - รหัสผู้ใช้งานที่ทำการอัปเดต (เพื่อบันทึกลง Log)
 * @returns {Promise<any>} ข้อมูล Alert หลังอัปเดตที่ถูกแมปเป็นรูปแบบตอบกลับของระบบ
 * @throws {Error} หากไม่พบ Alert ที่ต้องการอัปเดตหรือเกิดข้อผิดพลาดในฐานข้อมูล/การบันทึก Log
 *
 * @author Wanasart
 * @lastModified 2025-10-29
 */
export async function updateAlertStatus(alert_id: number, status: string, reason: string, user_id: number) {
    const { rows } = await pool.query(`
        UPDATE alerts
        SET 
            alr_status = $1,
            alr_reason = $2
        WHERE alr_id = $3
        RETURNING *;
    `, [status, reason, alert_id]);

    const log = await pool.query(`
      INSERT INTO alert_logs(
        alg_usr_id, 
        alg_alr_id, 
        alg_action, 
        alg_created_at
      )
      VALUES($1, $2, $3, CURRENT_TIMESTAMP);
    `,[
        user_id,
        rows[0].alr_id,
        `UPDATE_STATUS`,
      ]);

    return Mapping.mapAlertToSaveResponse(rows[0]);
}