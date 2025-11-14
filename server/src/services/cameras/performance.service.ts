import { pool } from '../../config/db';
import * as Mapping from '../../models/Mapping/cameras.map';

/**
 * ดึงข้อมูลประสิทธิภาพการทำงานของกล้องทั้งหมดประจำวัน
 * ใช้สำหรับแสดงสถิติหรือค่าการทำงานของกล้องในวันปัจจุบันจากมุมมอง (view) v_camera_performance_today
 * 
 * @returns {Promise<any[]>} รายการข้อมูลประสิทธิภาพของกล้องทั้งหมดในวันปัจจุบัน
 * @throws {Error} ถ้าเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 * 
 * @author Fasai
 * @lastModified 2025-10-16
 */
export async function getPerformance() {

    const { rows } = await pool.query(`
        SELECT * FROM v_camera_performance_today
    `);

    return rows;
}

/**
 * ดึงข้อมูลประสิทธิภาพการทำงานของกล้องตามรหัสที่ระบุ
 * ใช้สำหรับตรวจสอบค่าการทำงานเฉพาะของกล้องแต่ละตัวในวันปัจจุบัน
 * 
 * @param {number} camera_id - รหัสของกล้องที่ต้องการดูข้อมูลประสิทธิภาพ
 * @returns {Promise<any[]>} รายการข้อมูลประสิทธิภาพของกล้องที่ระบุ
 * @throws {Error} ถ้าไม่พบข้อมูลของกล้องหรือเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 * 
 * @author Fasai
 * @lastModified 2025-10-16
 */
export async function getPerformanceById(camera_id: number) {

    const { rows } = await pool.query(`
        SELECT * FROM v_camera_performance_today
        WHERE camera_id = $1
        `,
        [
            camera_id
        ]
    );
    
    return rows;
}