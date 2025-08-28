import { pool } from '../../config/db';
import * as Model from '../../models/cameras.model';
import * as Mapping from '../../models/Mapping/cameras.map';

export type UpdateCameraInput = Partial<Model.CreateCameraInput>; // แปลงค่าให้เป็น optional เพื่อจะได้ทำอัพเดตหากไม่ส่งค่านั้นมาก็ไม่เป็นไร

/**
 * ดึงรายการกล้องทั้งหมดจากฐานข้อมูล
 *
 * @returns {Promise<any[]>} รายการกล้องทั้งหมด
 * 
 * @author Wanasart
 */
export async function listCameras(): Promise<Model.Camera[]> {
  // const { rows } = await pool.query(`
  //   SELECT * FROM cameras
  //   JOIN locations ON cam_location_id = loc_id
  //   WHERE cam_is_use = true 
  //   ORDER BY cam_id ASC
  //   `);
  const { rows } = await pool.query(`
      SELECT * FROM cameras
      JOIN locations ON cam_location_id = loc_id
	    LEFT JOIN LATERAL (
        SELECT mnt_camera_id,mnt_date
        FROM maintenance_history
        WHERE mnt_camera_id = cam_id
        AND mnt_is_use = true
        ORDER BY mnt_date DESC, mnt_id DESC
        LIMIT 1
      ) AS last_mnt ON TRUE
      WHERE cam_is_use = true 
      ORDER BY cam_id ASC
    `);

  return rows.map(Mapping.mapToCamera);
}

/**
 * ดึงข้อมูลกล้องตาม ID
 *
 * @param {number} cam_id - รหัสของกล้องที่ต้องการดึงข้อมูล
 * @returns {Promise<Model.Camera>} ข้อมูลกล้องที่ตรงกับ ID ที่ระบุ
 * 
 * @author Wanasart
 */
export async function getCameraById(cam_id: number): Promise<Model.Camera> {
  // const { rows } = await pool.query(`
  //     SELECT * FROM cameras
  //     JOIN locations ON cam_location_id = loc_id
  //     WHERE cam_is_use = true
  //     AND cam_id = $1
  //     `, [cam_id]);
  const { rows } = await pool.query(`
      SELECT * FROM cameras
      JOIN locations ON cam_location_id = loc_id
	    LEFT JOIN LATERAL (
        SELECT mnt_camera_id,mnt_date
        FROM maintenance_history
        WHERE mnt_camera_id = cam_id
        AND mnt_is_use = true
        ORDER BY mnt_date DESC, mnt_id DESC
        LIMIT 1
      ) AS last_mnt ON TRUE
      WHERE cam_is_use = true 
      AND cam_id = $1
      `, [cam_id]);

  return Mapping.mapToCamera(rows[0]);
}

/**
 * ดึงรายการ Camera Cards พร้อมข้อมูล Location*
 * @returns {Promise<any[]>} รายการกล้อง
 * (id, status, name, type, health, location)
 * 
 * @author Wongsakon
 */
export async function getCardsSummary() {
  const result = await pool.query(`
      SELECT cam_id, cam_status, cam_name, cam_type, cam_health, loc_name 
      FROM cameras 
      INNER JOIN locations ON cam_location_id = loc_id"
  `);
  return result.rows;
}

/**
 * นับจำนวนกล้องทั้งหมดที่ใช้งานอยู่
 *
 * @returns {Promise<any[]>} จำนวนกล้องที่ใช้งานอยู่ทั้งหมด
 * 
 * @author Premsirigul
 */
export async function countCameras() {
  const result = await pool.query(`
        SELECT COUNT(*)::int 
        FROM cameras 
        WHERE cam_is_use = true
    `);
  return result.rows;
}


/**
 * สร้างกล้องใหม่โดยการเพิ่มข้อมูลตาม CreateCameraInput
 * @param {input: CreateCameraInput} สร้างกล้องตามฟิลด์ข้อมูลของ CreateCameraInput 
 * @returns {CamerasRow} รายการของ Camera ที่สร้าง
 * @author Chokchai
 */
export async function createCamera(input: Model.CreateCameraInput): Promise<Model.Camera> { //สร้างกล้องตัวใหม่

  const existing = await pool.query<Model.Camera>(`
      SELECT * FROM cameras
           WHERE cam_name = $1 AND cam_is_use = TRUE
      `, [input.cam_name]);
  if (existing.rows.length > 0) {
    throw new Error('Cameras name already exists');
  }

  const values = [
    input.cam_name ?? null,
    input.cam_address ?? null,
    input.cam_type ?? null,
    input.cam_resolution ?? null,
    input.cam_description ?? null,
    input.cam_installation_date ?? new Date().toISOString(),
    input.cam_status ?? true,
    input.cam_health ?? 100,
    input.cam_video_quality ?? 80.66,
    input.cam_network_latency ?? 20,
    input.cam_location_id ?? null,
  ];


  // const existing = await pool.query<UserRow>(`
  //         SELECT * FROM users
  //         WHERE usr_username = $1 OR usr_email = $2
  //     `, [username, email]);
  //     if (existing.rows.length > 0){
  //         throw new Error('Username or email already exists');
  //     }

  const sql = `
    INSERT INTO public.cameras
      (cam_name, cam_address, cam_type, cam_resolution, cam_description,
       cam_installation_date, cam_status, cam_health, cam_video_quality, cam_network_latency,
        cam_location_id)
    VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING
      cam_id, cam_name, cam_address, cam_type, cam_resolution, cam_description,
      cam_installation_date, cam_status, cam_health, cam_video_quality, cam_network_latency,
      cam_is_use, cam_location_id
  `;
  const r = await pool.query(sql, values);
  return r.rows[0] as Model.Camera;
}

/**
 * แก้ไขไขข้อมูลของกล้องจาก id ที่ส่งมา และจะแก้ไขข้อมูลตามฟิลด์ที่ส่งมาหากไม่ได้ส่งมาข้อมูลก็จะไม่ถูกแก้ไข
 * @param {camId: number , patch: UpdateCameraInput} รหัสของ cameras cam_id และ ฟิลด์ของ allowed
 * @returns {CamerasRow} รายการของ Camera ที่แก้ไข
 * @author Chokchai
 */
export async function updateCamera(camId: number, patch: UpdateCameraInput): Promise<Model.Camera | null> { //แก้ไขข้อมูลกล้อง

  if (patch.cam_name) {
    const existing = await pool.query<Model.Camera>(
      `SELECT cam_id 
       FROM cameras 
       WHERE cam_name = $1 
         AND cam_is_use = TRUE 
         AND cam_id <> $2`, // ไม่เอาตัวเอง
      [patch.cam_name, camId]
    );

    if (existing.rows.length > 0) {
      throw new Error("Camera name already exists");
    }
  }

  
  if (!Number.isInteger(camId)) {
    throw new Error("camId must be an integer");
  }

  const allowed = new Set([
    'cam_name',
    'cam_location_id',
    'cam_type',
    'cam_address',
    'cam_status',
    'cam_description',
    'cam_resolution',
  ]);
  const entries = Object.entries(patch).filter(([key, value]) => allowed.has(key) && value !== undefined); //แปลงข้อมูลให้เป็น Array คู่ จากนั้นทำการ filter

  if (!entries.length) return null;
  const set = entries.map(([k], i) => `${k} = $${i + 1}`).join(', '); //วนลูปเพื่อดึงค่าของ Key => ให้ค่าตัวแรกเริ่มนับที่ 1 จากนั้น join ด้วย , 
  // [k] หยิบตัวแรก => ["cam_name = $1"]
  const val = entries.map(([, v]) => v);

  const sql = `
    UPDATE public.cameras
    SET ${set}
    WHERE cam_id = $${entries.length + 1} AND cam_is_use = true
    RETURNING cam_id, cam_name, cam_location_id, cam_type, cam_address, cam_status, cam_description, cam_resolution
  `;

  const r = await pool.query<Model.Camera>(sql, [...val, camId]);
  return r.rows[0] ?? null;

}

/**
 * ลบข้อมูลกล้องแบบ Softdelete
 * @param {camId: number} รหัสของ cameras cam_id 
 * @returns {Promise<boolean>} คืนค่าเป็น boolean 
 * @author Chokchai
 */
export async function softDeleteCamera(camId: number): Promise<boolean> { //ลบข้อมูลกล้องแบบ soft delete
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
export async function searchCameras({ id, name, location }: { id?: number; name?: string; location?: string }) {
  const conds: string[] = []; // เก็บเงื่อนไข WHERE
  const params: any[] = []; // เก็บค่าพารามิเตอร์สำหรับ
  let i = 1;
  if (id) {                      // ถ้ามี id ให้ค้น
    conds.push(`c.cam_id = $${i++}`);
    params.push(id);
  }
  if (name) {
    conds.push(`c.cam_name ILIKE $${i++}`);
    params.push(`%${name}%`);
  }
  if (location) {
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
 * นับจำนวนกล้องทั้งหมดที่ไม่ได้ใช้งาน
 *
 * @returns {Promise<any[]>} จำนวนกล้องที่ไม่ได้ใช้งาน
 * 
 * @author Napat
 */
export async function countInactiveCameras() {
  const result = await pool.query(`
        SELECT COUNT(*)::int
        FROM cameras 
        WHERE cam_status = false"
    `);
  return result.rows;
}

/**
 * เปลี่ยนสถานะของกล้อง
 *
 * @param {string} cam_id - ไอดีของ cam ที่จะเปลี่ยนสถานะ
 * @param {string} cam_status - สถานะที่จะเปลี่ยน
 * @returns {Promise<any[]>} กล้องที่ถูกอัปเดต
 * @throws {Error} ถ้าไม่พบ camera หรือไม่สามารถอัปเดตได้
 * 
 * @author Audomsak
 * 
 */
export async function updateCameraStatus(cam_id: number, cam_status: boolean) {
  const cameraExists = await pool.query(`
        SELECT cam_id FROM cameras 
        WHERE cam_id = $1
        AND cam_is_use = true
    `, [cam_id]);

  if (cameraExists.rows.length === 0) {
    throw new Error('Camera not found or Camera not in use');
  }

  const result = await pool.query(`
        UPDATE cameras 
        SET cam_status = $1 
        WHERE cam_id = $2 
        RETURNING *
    `, [cam_status, cam_id]);
  return result.rows[0]; // คืนค่ากล้องที่ถูกอัพเดต
}

export async function countStatusCameras(): Promise<Model.CameraStatus> {
  const { rows } = await pool.query(`
    SELECT 
      COUNT(*) FILTER (WHERE cam_is_use = true) AS total,
      COUNT(*) FILTER (WHERE cam_is_use = true AND cam_status = true) AS active,
      COUNT(*) FILTER (WHERE cam_is_use = true AND cam_status = false) AS inactive,
      ROUND((AVG(cam_health) FILTER (WHERE cam_is_use))::numeric, 2)::float AS avg_health
    FROM cameras
  `);

  const r = rows[0];
  return {
    total: Number(r.total),
    active: Number(r.active),
    inactive: Number(r.inactive),
    avg_health: r.avg_health,
  };
}