import { pool } from '../config/db';

/**
 * เพิ่มข้อมูลของ Event
 *
 * ฟังก์ชันนี้จะเพิ่มไอคอน, ชื่อ, และคำอธิบายของ Event ในฐานข้อมูล
 * หากเพิ่มไม่สำเร็จ จะโยน Error
 *
 * @param {string} evt_icon - ไอคอนใหม่ของ Event
 * @param {string} evt_name - ชื่อใหม่ของ Event
 * @param {string} evt_des - คำอธิบายใหม่ของ Event
 * @returns {Promise<object>} Event object หลังเพิ่มสำเร็จ
 * @throws {Error} เมื่อเพิ่ม Event ไม่สำเร็จ
 *
 * @author Fasai
 */
export async function createEvent(evt_icon: string, evt_name: string, evt_des: string) {
    const { rows } = await pool.query(`
        INSERT INTO events(evt_icon, evt_name, evt_description) 
        VALUES($1, $2, $3)
        RETURNING *
    `, [evt_icon, evt_name, evt_des]);

    const events = rows[0];

    if (!events) {
        throw new Error('Failed to insert events');
    }

    return events;
}

/**
 * ดึงรายการ Events ทั้งหมดที่ยังใช้งานอยู่
 *
 * @returns {Promise<Event[]>} รายการ Events ที่ถูกใช้งานอยู่ทั้งหมด
 * @description ดึงข้อมูล Events จากฐานข้อมูลโดยเรียงตาม evt_id จากมากไปน้อย และแสดงเฉพาะ Events ที่ยังใช้งานอยู่

 * 
 * @author Jirayu
 */
export async function getAllEvents(): Promise<Event[]> {
    const query = `
        SELECT evt_id, evt_icon, evt_name, evt_description, evt_is_use
        FROM events 
        WHERE evt_is_use = true
        ORDER BY evt_id DESC
    `;
    
    const { rows } = await pool.query<Event>(query);
    return rows;
}

/**
 * อัปเดตข้อมูลของ Event ที่ระบุด้วย evt_id
 *
 * ฟังก์ชันนี้จะอัปเดตไอคอน, ชื่อ, และคำอธิบายของ Event ในฐานข้อมูล
 * หากพบ Event ตาม evt_id จะคืนค่าเป็น object ของ Event หลังการอัปเดต
 * หากไม่พบ Event หรืออัปเดตไม่สำเร็จ จะโยน Error
 *
 * @param {number} evt_id - รหัสของ Event ที่ต้องการอัปเดต
 * @param {string} evt_icon - ไอคอนใหม่ของ Event
 * @param {string} evt_name - ชื่อใหม่ของ Event
 * @param {string} evt_des - คำอธิบายใหม่ของ Event
 * @returns {Promise<object>} Event object หลังอัปเดต
 * @throws {Error} เมื่อไม่พบ Event หรืออัปเดตไม่สำเร็จ
 *
 * @author Fasai
 */
export async function updateEvent(evt_id: number, evt_icon: string, evt_name: string, evt_des: string) {
    const { rows } = await pool.query(`
        UPDATE events
        SET evt_icon = $1,
            evt_name = $2,
            evt_description = $3
        WHERE evt_id = $4
        RETURNING *;
        `, [evt_icon, evt_name, evt_des, evt_id]);

    const events = rows[0];

    if (!events) {
        throw new Error('Failed to update event or event not found');
    }

    return events;
}

/**
 * ลบข้อมูลของ Event ที่ระบุด้วย evt_id
 *
 * ฟังก์ชันนี้จะลบโดยอัปเดตสถานะของ Event ในฐานข้อมูลแทนการลบจริง ๆ
 * หากพบ Event ตาม evt_id จะคืนค่าเป็น object ของ Event หลังการลบ
 * หากไม่พบ Event หรือลบไม่สำเร็จ จะโยน Error
 *
 * @param {number} evt_id - รหัสของ Event ที่ต้องการลบ
 * @param {boolean} evt_is_use - สถานะใหม่ของ Event
 * @returns {Promise<object>} Event object หลังลบ
 * @throws {Error} เมื่อไม่พบ Event หรือลบไม่สำเร็จ
 *
 * @author Fasai
 */

export async function deleteEvent(evt_id: number, evt_is_use: boolean) {
    const { rows } = await pool.query(`
        UPDATE events
        set evt_is_use = $1
        WHERE evt_id = $2
        RETURNING *;
        `, [evt_is_use, evt_id]);

    const events = rows[0];

    if (!events) {
        throw new Error('Failed to delete event or event not found');
    }

    return events
}