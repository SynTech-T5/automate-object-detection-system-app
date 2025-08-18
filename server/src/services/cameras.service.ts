import { pool } from '../config/db';
import type { CamerasRow, CreateCameraInput } from '../models/cameras.model';
export type UpdateCameraInput = Partial<CreateCameraInput>; // แปลงค่าให้เป็น optional เพื่อจะได้ทำอัพเดตหากไม่ส่งค่านั้นมาก็ไม่เป็นไร


export async function listCameras() {
    const result = await pool.query(
      `SELECT * 
      FROM public.cameras 
      WHERE cam_is_use IS TRUE
      ORDER BY cam_id ASC`
    );
    return result.rows;
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
    input.cam_is_use ?? true,        // default เป็น true หากไม่ได้ส่งมา
    input.cam_location_id ?? null,
  ];

  const sql = `
    INSERT INTO public.cameras
      (cam_name, cam_address, cam_type, cam_resolution, cam_description,
       cam_installation_date, cam_health, cam_video_quality, cam_network_latency,
       cam_is_use, cam_location_id)
    VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING
      cam_id, cam_name, cam_address, cam_type, cam_resolution, cam_description,
      cam_installation_date, cam_health, cam_video_quality, cam_network_latency,
      cam_is_use, cam_location_id
  `;
    const r = await pool.query(sql, values);
    return r.rows[0] as CamerasRow;
}

/**
 * แก้ไขไขข้อมูลของกล้องจาก id ที่ส่งมา และจะแก้ไขข้อมูลตามฟิลด์ที่ส่งมาหากไม่ได้ส่งมาข้อมูลก็จะไม่ถูกแก้ไข
 * @param {camId: number , patch: UpdateCameraInput} รหัสของ cameras cam_id และ ฟิลด์ของ allowed
 * @returns {CamerasRow} รายการของ Camera ที่แก้ไข
 * @author Chokchai
 */

export async function updateCamera(camId: number , patch: UpdateCameraInput): Promise<CamerasRow | null>{ //แก้ไขข้อมูลกล้อง
  
  const allowed = new Set([
    'cam_name',
    'cam_location_id',
    'cam_type',
    'cam_address',
    'cam_resolution'
  ]);
  const entries = Object.entries(patch).filter(([key, value]) =>  allowed.has(key) && value !== undefined); //แปลงข้อมูลให้เป็น Array คู่ จากนั้นทำการ filter
  
  if (!entries.length) return null;
  const set  = entries.map(([k], i) => `${k} = $${i + 1}`).join(', '); //วนลูปเพื่อดึงค่าของ Key => ให้ค่าตัวแรกเริ่มนับที่ 1 จากนั้น join ด้วย , 
  // [k] หยิบตัวแรก => ["cam_name = $1"]
  const val = entries.map(([, v]) => v);

  const sql = `
    UPDATE public.cameras
    SET ${set}
    WHERE cam_id = $${entries.length + 1} AND cam_is_use = true
    RETURNING cam_id, cam_name, cam_location_id, cam_type, cam_address, cam_resolution
  `;

  const r = await pool.query<CamerasRow>(sql, [...val, camId]);
  return r.rows[0] ?? null;

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