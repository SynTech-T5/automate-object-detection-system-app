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
    
    if(!events){
        throw new Error('Failed to insert events');
    }

    return events;
}