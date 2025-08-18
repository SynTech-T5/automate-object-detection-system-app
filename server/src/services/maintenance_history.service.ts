import { pool } from '../config/db';
import { MaintenanceHistory, MaintenanceType } from '../models/maintenance_history.model';

/**
 * เพิ่มข้อมูลของ Maintenance History
 *
 * ฟังก์ชันนี้จะเพิ่มวันที่, ประเภท, ชื่อของช่างซ่อม และคำอธิบายของ Maintenance History ในฐานข้อมูล
 * หากเพิ่มไม่สำเร็จ จะโยน Error
 *
 * @param {Date} date - วันที่ที่เพิ่มข้อมูล
 * @param {MaintenanceType} type - ประเภทของการซ่อม
 * @param {string} technician - ชื่อของช่างที่ซ่อม
 * @param {string} note - คำอธิบายของ Maintenance History
 * @param {number} camId - ID ของกล้องที่ซ่อม
 * @returns {Promise<object>} Maintenance History object หลังเพิ่มสำเร็จ
 * @throws {Error} เมื่อเพิ่ม Maintenance History ไม่สำเร็จ
 *
 * 
 * @author Napat
 */
export async function createMaintenanceHistory(camId: number, date: Date, type: MaintenanceType, technician: string, note: string) {
    const { rows } = await pool.query<MaintenanceHistory>(`
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