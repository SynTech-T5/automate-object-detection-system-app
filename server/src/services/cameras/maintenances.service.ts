import { pool } from '../../config/db';

/**
 * ดึงรายการประวัติการซ่อมบำรุงกล้องทั้งหมด
 *
 * @returns {Promise<any[]>} รายการประวัติการซ่อมบำรุงกล้องทั้งหมด
 * @description ดึงข้อมูลประวัติการซ่อมบำรุงจากฐานข้อมูลโดยเรียงตามวันที่จากใหม่ไปเก่า
*
 * @author Jirayu
 */
export async function listAllMaintenances(): Promise<any[]> {
    const query = `
        SELECT *
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
export async function listMaintenancesByCamera(cam_id: number): Promise<any[]> {
    const query = `
        SELECT *
        FROM maintenance_history 
        WHERE mnt_camera_id = $1 
        AND mnt_is_use = true
        ORDER BY mnt_date DESC
    `;

    const result = await pool.query(query, [cam_id]);

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
 * @param {MaintenanceType} type - ประเภทของการซ่อม
 * @param {string} technician - ชื่อของช่างที่ซ่อม
 * @param {string} note - คำอธิบายของ Maintenance History
 * @returns {Promise<object>} Maintenance History object หลังเพิ่มสำเร็จ
 * @throws {Error} เมื่อเพิ่ม Maintenance History ไม่สำเร็จ
 *
 * 
 * @author Napat
 */
export async function createMaintenance(camId: number, date: Date, type: string, technician: string, note: string) {
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
 * อัพเดทข้อมูลของ Maintenance History
 *
 * ฟังก์ชันนี้จะอัพเดทวันที่, ประเภท, ชื่อของช่างซ่อม และคำอธิบายของ Maintenance History ในฐานข้อมูล
 * หากอัพเดทไม่สำเร็จ จะโยน Error
 *
 * @param {number} mnt_id - ID ของ Maintenance History
 * @param {Date} date - วันที่ที่อัพเดทข้อมูล
 * @param {MaintenanceType} type - ประเภทของการซ่อม
 * @param {string} technician - ชื่อของช่างที่ซ่อม
 * @param {string} note - คำอธิบายของ Maintenance History
 * @returns {Promise<object>} Maintenance History object หลังอัพเดทสำเร็จ
 * @throws {Error} เมื่ออัพเดท Maintenance History ไม่สำเร็จ
 *
 * 
 * @author Napat
 */
export async function updateMaintenance(mnt_id: number, date: Date, type: string, technician: string, note: string) {
    const { rows } = await pool.query(`
        UPDATE maintenance_history
        SET mnt_date = $2,
            mnt_type = $3,
            mnt_technician = $4,
            mnt_note = $5
        WHERE mnt_id = $1
        RETURNING *;
        `, [mnt_id, date, type, technician, note]);

    const maintenanceHistory = rows[0];

    if (!maintenanceHistory) {
        throw new Error('Failed to update maintenance history or maintenance history not found');
    }

    return maintenanceHistory
}

/**
 * ลบข้อมูลของ Maintenance History
 *
 * ฟังก์ชันนี้จะลบ maintenance history ตาม ID ในฐานข้อมูล
 * หากลบไม่สำเร็จ จะโยน Error
 *
 * @param {number} mnt_id - ID ของประวัติการซ่อมบำรุง
 * @param {boolean} isUse - สถานะของประวัติการซ่อมบำรุง
 * @returns {Promise<object>} Maintenance History object หลังลบสำเร็จ
 * @throws {Error} เมื่อลบ Maintenance History ไม่สำเร็จ
 *
 * 
 * @author Napat
 */
export async function softDeleteMaintenance(mnt_id: number, isUse: boolean) {
    const { rows } = await pool.query(`
        UPDATE maintenance_history
        set mnt_is_use = $1
        WHERE mnt_id = $2
        RETURNING *;
        `, [isUse, mnt_id]);

    const maintenanceHistory = rows[0];

    if (!maintenanceHistory) {
        throw new Error('Failed to delete maintenance history or maintenance history not found');
    }

    return maintenanceHistory
}