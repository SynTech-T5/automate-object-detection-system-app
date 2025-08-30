import { pool } from '../config/db';
import * as Model from "../models/events.model"
import * as Mapping from "../models/Mapping/events.map"


/**
 * ดึงรายการ Events ทั้งหมดที่ยังใช้งานอยู่
 *
 * @returns {Promise<Event[]>} รายการ Events ที่ถูกใช้งานอยู่ทั้งหมด
 * @description ดึงข้อมูล Events จากฐานข้อมูลโดยเรียงตาม evt_id จากมากไปน้อย และแสดงเฉพาะ Events ที่ยังใช้งานอยู่

 * 
 * @author Jirayu
 */
export async function getAllEvents(): Promise<Model.Events[]> {
    const query = `
        SELECT evt_id, evt_icon, evt_name, evt_description, evt_status, evt_is_use
        FROM events 
        WHERE evt_is_use = true
        ORDER BY evt_id DESC
    `;

    const result = await pool.query<Event>(query);
    return result.rows.map(Mapping.mapToEvent);
}

export async function getEventById(evt_id: number): Promise<Model.Events> {
    const { rows } = await pool.query(`
        SELECT * FROM events
        WHERE evt_id = $1
        AND evt_is_use = true    
    `, [evt_id]) 

    return Mapping.mapToEvent(rows[0]);
}

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
 * 
 * @author Fasai
 */
export async function createEvent(evt_icon: string, evt_name: string, evt_des: string, evt_status: boolean): Promise<Model.Events> {


    if (!evt_icon.trim() || !evt_name.trim() || !evt_des.trim()) {
        throw new Error("Event fields cannot be empty");
    }

    // const eventExists = await pool.query(`
    //     SELECT evt_id FROM events
    //     WHERE evt_name = $1 
    //     AND evt_is_use = true`,
    //     [evt_name]
    // )

    // if (eventExists.rows.length > 0) {
    //     throw new Error('Event already exists');
    // }

    const { rows } = await pool.query(`
        INSERT INTO events(evt_icon, evt_name, evt_description, evt_status) 
        VALUES($1, $2, $3, $4)
        RETURNING *
    `, [evt_icon, evt_name, evt_des, evt_status]);

    const events = rows[0];

    if (!events) {
        throw new Error('Failed to insert events');
    }

    return Mapping.mapToEvent(rows[0]);
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
export async function updateEvent(evt_id: number, evt_icon: string, evt_name: string, evt_des: string): Promise<Model.Events> {

    if (!evt_icon.trim() || !evt_name.trim() || !evt_des.trim()) {
        throw new Error("Event fields cannot be empty");
    }

    const eventExists = await pool.query(`
        SELECT evt_id FROM events
        WHERE evt_id = $1 
        AND evt_is_use = true`,
        [evt_id]
    )

    if (eventExists.rows.length === 0) {
        throw new Error("Event not found or inactive");
    }

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

    return Mapping.mapToEvent(events);
    
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
export async function deleteEvent(evt_id: number, evt_is_use: boolean): Promise<Model.EventSafeDelete> {

    const eventExists = await pool.query(`
      SELECT evt_id FROM events
      WHERE evt_id = $1
      AND evt_is_use = true  
    `, [evt_id]
    )

    if (eventExists.rows.length === 0) {
        throw new Error('Event not found');
    }

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