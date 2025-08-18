import { promises } from 'dns';
import { pool } from '../config/db';
import type { CamerasRow, CreateCameraInput } from '../models/cameras.model';

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
 * ลบข้อมูลกล้องแบบ Softdelete
 * @param {camId: number} รหัสของ cameras cam_id 
 * @returns {Promise<boolean>} คืนค่าเป็น boolean 
 * @author Chokchai
 */
export async function deleteCamera(camId: number): Promise<boolean> { //ลบข้อมูลกล้องแบบ soft delete
  try {
    const sql = `
    UPDATE public.cameras 
    SET cam_is_use = false
    WHERE cam_id = $1 
      AND cam_is_use IS DISTINCT FROM FALSE   
    RETURNING cam_id`;
    const r = await pool.query<{ cam_id: number }>(sql, [camId]);
    return r.rows.length > 0;
  } catch (err) {
    // log แล้วค่อยตัดสินใจว่าจะโยนออก/คืน false
    console.error('deleteCamera error:', err);
    return false;
  }
}

/**
 * ค้นหากล้องโดยจะรับข้อมูลเป็น id ชื่อกล้อง ชื่อสถานที่ 
 * @param {id?:number; name?: string; location?:string} เลือกกรอกกรอกข้อมูล ชื่อกล้อง id กล้อง สถานที่ของกล้อง 
 * @returns cam_id คืนเลข id ของกล้องที่เจอ
 * @author Chokchai
 */
export async function findCameras({id,name,location} : {id?:number; name?: string; location?:string}) {
  const conds:string[] = []; // เก็บเงื่อนไข WHERE
  const params:any[] = []; // เก็บค่าพารามิเตอร์สำหรับ
  let i = 1;
  if(id){                      // ถ้ามี id ให้ค้น
    conds.push(`c.cam_id = $${i++}`);
    params.push(id);
  }
  if(name){
    conds.push(`c.cam_name ILIKE $${i++}`);
    params.push(`%${name}%`);
  }
  if (location){ 
    conds.push(`l.loc_name ILIKE $${i++}`);   
    params.push(`%${location}%`); 
  }
  if (conds.length === 0) {
    throw new Error('id or name or location required');
  }
  
  const sql = `
    SELECT c.*, l.loc_name AS location_name
    FROM public.cameras c
    LEFT JOIN public.locations l ON l.loc_id = c.cam_location_id   
    WHERE (${conds.join(' OR ')}) 
      AND c.cam_is_use IS TRUE
    ORDER BY c.cam_id ASC
    `;
  
  const r = await pool.query(sql, params);
  return r.rows.map((row: any) => row.cam_id);;
}

/**
 * สร้างกล้องใหม่โดยการเพิ่มข้อมูลตาม CreateCameraInput
 * @param {input: CreateCameraInput} สร้างกล้องตามฟิลด์ข้อมูลของ CreateCameraInput 
 * @returns {CamerasRow} รายการของ Camera ที่สร้าง
 * @author Chokchai
 */
export async function createCameras(input: CreateCameraInput): Promise<CamerasRow>{ //สร้างกล้องตัวใหม่

    const values = [
    input.cam_name ?? null,
    input.cam_address ?? null,
    input.cam_type ?? null,
    input.cam_resolution ?? null,
    input.cam_description ?? null,
    input.cam_installation_date ?? null,
    input.cam_health ?? null,
    input.cam_video_quality ?? null,
    input.cam_network_latency ?? null,
    input.cam_location_id ?? null,
  ];

  const sql = `
    INSERT INTO public.cameras
      (cam_name, cam_address, cam_type, cam_resolution, cam_description,
       cam_installation_date, cam_health, cam_video_quality, cam_network_latency,
        cam_location_id)
    VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING
      cam_id, cam_name, cam_address, cam_type, cam_resolution, cam_description,
      cam_installation_date, cam_health, cam_video_quality, cam_network_latency,
      cam_is_use, cam_location_id
  `;
    const r = await pool.query(sql, values);
    return r.rows[0] as CamerasRow;
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


/**
 * ดึงข้อมูล Access Control ของกล้องตาม cam_id
 *
 * @param {number} caa_camera_id - รหัสกล้องที่ต้องการดึงข้อมูล access control
 * @returns {Promise<object[]>} รายการ access control ของกล้องที่เลือก
 *
 * @author Jirayu
 */
export async function showCameraAccessControlById(caa_camera_id: number) {
    const query = `SELECT 
                    caa_require_auth,
                    caa_restrict,
                    caa_log,
                    caa_camera_id 
                  FROM cameras_access
                  WHERE caa_camera_id = $1`;
    const result = await pool.query(query, [caa_camera_id]);
    return result.rows;
}

/**
 * ดึงข้อมูล Access Control ของกล้องทั้งหมด
 *
 * @returns {Promise<object[]>} รายการ access control ของกล้องทั้งหมด
 *
 * @author Jirayu
 */
export async function showCameraAccessControl() {
    const query = `SELECT *
                   FROM cameras_access`;
    const result = await pool.query(query);
    return result.rows;
}