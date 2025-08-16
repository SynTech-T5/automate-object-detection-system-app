import { pool } from '../config/db';

/**
 * ดึงรายการประวัติการซ่อมบำรุงทั้งหมด
 *
 * @returns {Promise<any[]>} รายการประวัติการซ่อมบำรุงทั้งหมด
 * @description ดึงข้อมูลจากฐานข้อมูล โดยแปลงวันที่เป็น วัน-เดือน-ปี (ค.ศ.)
 */
export async function getAllMaintenanceHistory(): Promise<any[]> {
    const query = `
        SELECT 
            mnt_id,
            mnt_date,
            mnt_type,
            mnt_technician,
            mnt_note,
            mnt_is_use,
            mnt_camera_id
        FROM maintenance_history 
        WHERE mnt_is_use = true
        ORDER BY mnt_date DESC
    `;

    const { rows } = await pool.query(query);

    return rows.map(row => {
        const date = new Date(row.mnt_date);

       
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear().toString();

        const thDate = `${day}-${month}-${year}`;

        return {
            mnt_id: row.mnt_id,
            mnt_date: thDate,
            mnt_type: row.mnt_type,
            mnt_technician: row.mnt_technician,
            mnt_note: row.mnt_note,
            mnt_is_use: row.mnt_is_use,
            mnt_camera_id: row.mnt_camera_id
        };
    });
}
