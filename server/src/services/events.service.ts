import { pool } from "../config/db";
import * as Model from "../models/events.model";
import * as Mapping from "../models/Mapping/events.map";

/**
 * ดึงรายการเหตุการณ์ (events) ที่เปิดใช้งานทั้งหมดจากตาราง events
 * เหมาะสำหรับโหลดไปแสดงในหน้า Event Management / ตัวเลือกในฟอร์ม
 *
 * @returns {Promise<Array<Model.Event>>} รายการเหตุการณ์ที่ evt_is_use = true เรียงตาม evt_id ASC
 * @throws {Error} หากเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-26
 */
export async function getEvents() {
  const { rows } = await pool.query(`
        SELECT
            evt_id, 
            evt_icon, 
            evt_name, 
            evt_description, 
            evt_created_at, 
            evt_updated_at, 
            evt_is_use
        FROM events
        WHERE evt_is_use = true
        ORDER BY evt_id ASC;
    `);

  return rows.map(Mapping.mapEventsToSaveResponse);
}

/**
 * ดึงรายละเอียดเหตุการณ์ (event) ตามรหัสที่ระบุ
 * คัดเฉพาะเหตุการณ์ที่ยังเปิดใช้งาน (evt_is_use = true)
 *
 * @param {number} event_id - รหัสเหตุการณ์ที่ต้องการค้นหา
 * @returns {Promise<Model.Event>} ข้อมูลเหตุการณ์ที่พบ (หรือ undefined หากไม่พบ)
 * @throws {Error} หากเกิดข้อผิดพลาดระหว่างการค้นหาในฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-26
 */
export async function getEventById(event_id: number) {
  const { rows } = await pool.query(
    `
    SELECT
        evt_id, 
        evt_icon, 
        evt_name, 
        evt_description, 
        evt_created_at, 
        evt_updated_at, 
        evt_is_use
        FROM events
    WHERE evt_id = $1
    AND evt_is_use = true;`,
    [event_id]
  );
  return Mapping.mapEventsToSaveResponse(rows[0]);
}

/**
 * สร้างเหตุการณ์ใหม่ (event) และอัปเดตการตั้งค่าการตรวจจับระดับ Global (GDS) ของเหตุการณ์นั้น
 * จากนั้นดึงข้อมูลภาพรวม (overview) ของเหตุการณ์ที่สร้างคืนให้
 *
 * @param {string} icon_name - ชื่อไอคอนของเหตุการณ์ (เช่น 'Camera', 'AlertTriangle')
 * @param {string} event_name - ชื่อเหตุการณ์ (ต้องไม่ซ้ำ)
 * @param {string} description - คำอธิบายของเหตุการณ์
 * @param {string} sensitivity - ค่าความไวของ GDS (เช่น critical, high, medium, low)
 * @param {string} priority - ระดับความสำคัญของ GDS
 * @param {boolean} status - สถานะเปิด/ปิดของ GDS
 * @returns {Promise<Model.EventOverview>} แถวข้อมูลจากมุมมอง v_events_overview ของเหตุการณ์ที่สร้าง
 * @throws {Error} หากชื่อเหตุการณ์ซ้ำ (รหัส 23505) หรือเกิดข้อผิดพลาดอื่นระหว่างการทำธุรกรรม
 *
 * @author Wanasart
 * @lastModified 2025-10-26
 */
export async function insertEvent(
  icon_name: string,
  event_name: string,
  description: string,
  sensitivity: string,
  priority: string,
  status: boolean
) {
  try {
    // 🟦 1. INSERT event ใหม่
    const { rows: evtRows } = await pool.query(
      `
      INSERT INTO events (
        evt_icon, 
        evt_name, 
        evt_description
      )
      VALUES ($1, $2, $3)
      RETURNING evt_id;
      `,
      [icon_name, event_name, description]
    );

    const newEvent = evtRows[0];
    if (!newEvent) throw new Error("Failed to insert event");

    // 🟩 2. UPDATE GDS ที่เกี่ยวข้อง
    await pool.query(
      `
      UPDATE global_detection_settings
      SET
        gds_sensitivity = $1,
        gds_priority    = $2,
        gds_status      = $3,
        gds_updated_at  = CURRENT_TIMESTAMP
      WHERE gds_evt_id = $4;
      `,
      [sensitivity, priority, status, newEvent.evt_id]
    );

    // 🟨 3. ดึงข้อมูลจาก View
    const { rows: viewRows } = await pool.query(
      `
      SELECT * FROM v_events_overview
      WHERE event_id = $1;
      `,
      [newEvent.evt_id]
    );

    return viewRows[0];
  } catch (err: any) {
    // 🚨 ตรวจจับ error ชื่อซ้ำ
    if (err.code === "23505") {
      throw new Error("Event name already exists");
    }
    console.error("❌ insertEvent error:", err);
    throw err;
  }
}

/**
 * แก้ไขเหตุการณ์ (event) ที่มีอยู่ และอัปเดตการตั้งค่าการตรวจจับระดับ Global (GDS)
 * จากนั้นดึงข้อมูลภาพรวม (overview) ของเหตุการณ์ที่แก้ไขคืนให้
 *
 * @param {string} icon_name - ชื่อไอคอนของเหตุการณ์
 * @param {string} event_name - ชื่อเหตุการณ์ (ต้องไม่ซ้ำกับรายการอื่น)
 * @param {string} description - คำอธิบายเหตุการณ์
 * @param {string} sensitivity - ค่าความไวของ GDS
 * @param {string} priority - ระดับความสำคัญของ GDS
 * @param {boolean} status - สถานะเปิด/ปิดของ GDS
 * @param {number} event_id - รหัสเหตุการณ์ที่ต้องการแก้ไข
 * @returns {Promise<Model.EventOverview>} แถวข้อมูลจากมุมมอง v_events_overview ของเหตุการณ์ที่แก้ไข
 * @throws {Error} หากชื่อเหตุการณ์ซ้ำ (รหัส 23505) หรือเกิดข้อผิดพลาดอื่นในฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-26
 */
export async function updateEvent(
  icon_name: string,
  event_name: string,
  description: string,
  sensitivity: string,
  priority: string,
  status: boolean,
  event_id: number
) {
  try {
    // 🟦 1. UPDATE events
    await pool.query(
      `
      UPDATE events
      SET
        evt_icon = $1,
        evt_name = $2,
        evt_description = $3,
        evt_updated_at = CURRENT_TIMESTAMP
      WHERE evt_id = $4;
      `,
      [icon_name, event_name, description, event_id]
    );

    // 🟩 2. UPDATE global_detection_settings
    await pool.query(
      `
      UPDATE global_detection_settings
      SET
        gds_sensitivity = $1,
        gds_priority    = $2,
        gds_status      = $3,
        gds_updated_at  = CURRENT_TIMESTAMP
      WHERE gds_evt_id = $4;
      `,
      [sensitivity, priority, status, event_id]
    );

    // 🟨 3. ดึงข้อมูลจาก View
    const { rows: viewRows } = await pool.query(
      `
      SELECT * FROM v_events_overview
      WHERE event_id = $1;
      `,
      [event_id]
    );

    return viewRows[0];
  } catch (err: any) {
    if (err.code === "23505") {
      throw new Error("Event name already exists");
    }
    console.error("❌ updateEvent error:", err);
    throw err;
  }
}

/**
 * ลบเหตุการณ์แบบ Soft Delete โดยตั้งค่า evt_is_use = false
 * เหมาะสำหรับซ่อนเหตุการณ์ออกจากการใช้งานโดยไม่ลบข้อมูลจริง
 *
 * @param {number} event_id - รหัสเหตุการณ์ที่ต้องการปิดการใช้งาน
 * @returns {Promise<Model.Event>} ข้อมูลเหตุการณ์หลังจากถูกปิดการใช้งาน
 * @throws {Error} หากไม่พบเหตุการณ์ที่ต้องการลบหรือเกิดข้อผิดพลาดในฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-26
 */
export async function removeEvent(event_id: number) {
  const { rows } = await pool.query(
    `
    UPDATE events
    SET evt_is_use = false
    WHERE evt_id = $1
    RETURNING *;
    `,
    [event_id]
  );

  return Mapping.mapEventsToSaveResponse(rows[0]);
}

/**
 * ดึงรายการเหตุการณ์แบบภาพรวม (Global / Overview) จากมุมมอง v_events_overview
 * คัดเฉพาะเหตุการณ์ที่ยังใช้งานอยู่
 *
 * @returns {Promise<Array<Model.EventOverview>>} รายการเหตุการณ์จาก v_events_overview ที่ is_use = true
 * @throws {Error} หากเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-26
 */
export async function getGlobalEvents() {
  const { rows } = await pool.query(`
        SELECT * FROM v_events_overview
        WHERE is_use = true;
    `);

  return rows;
}

/**
 * ดึงเหตุการณ์แบบภาพรวม (Global / Overview) รายการเดียวจาก v_events_overview ตามรหัสที่ระบุ
 * คัดเฉพาะเหตุการณ์ที่ยังใช้งานอยู่
 *
 * @param {number} event_id - รหัสเหตุการณ์ที่ต้องการดึง
 * @returns {Promise<Model.EventOverview>} ข้อมูลภาพรวมของเหตุการณ์ (หรือรายการว่างหากไม่พบ)
 * @throws {Error} หากเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-26
 */
export async function getGlobalEventById(event_id: number) {
  const { rows } = await pool.query(
    `
    SELECT * FROM v_events_overview
    WHERE event_id = $1
    AND is_use = true;
  `,
    [event_id]
  );

  return rows;
}

/**
 * อัปเดตการตั้งค่าการตรวจจับระดับ Global (GDS) ของเหตุการณ์ที่ระบุ
 * ใช้สำหรับปรับ sensitivity, priority และ status
 *
 * @param {string} sensitivity - ค่าความไวในการตรวจจับ (critical, high, medium, low)
 * @param {string} priority - ระดับความสำคัญของเหตุการณ์
 * @param {boolean} status - สถานะเปิด/ปิดของการตรวจจับ
 * @param {number} event_id - รหัสเหตุการณ์ที่ต้องการอัปเดต
 * @returns {Promise<Model.GlobalDetectionSetting>} แถวข้อมูล GDS หลังอัปเดต
 * @throws {Error} หากไม่พบเหตุการณ์ที่ผูกกับ GDS หรือเกิดข้อผิดพลาดในฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-26
 */
export async function updateGlobalEvent(
  sensitivity: string,
  priority: string,
  status: boolean,
  event_id: number
) {
  const { rows } = await pool.query(
    `
    UPDATE global_detection_settings
    SET
        gds_sensitivity = $1,
        gds_priority = $2,
        gds_status = $3,
        gds_updated_at = CURRENT_TIMESTAMP
    WHERE gds_evt_id = $4
    RETURNING *;
  `,
    [sensitivity, priority, status, event_id]
  );

  return Mapping.mapGlobalEventsToSaveResponse(rows[0]);
}