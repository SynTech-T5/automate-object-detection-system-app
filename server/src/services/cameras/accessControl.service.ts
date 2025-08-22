import { pool } from '../../config/db';

/**
 * ดึงข้อมูล Access Control ของกล้องทั้งหมด
 *
 * @returns {Promise<object[]>} รายการ access control ของกล้องทั้งหมด
 *
 * @author Jirayu
 */
export async function listAccessControls() {
    const query = `SELECT *
                   FROM cameras_access`;
    const result = await pool.query(query);
    return result.rows;
}

/**
 * ดึงข้อมูล Access Control ของกล้องตาม cam_id
 *
 * @param {number} caa_camera_id - รหัสกล้องที่ต้องการดึงข้อมูล access control
 * @returns {Promise<object[]>} รายการ access control ของกล้องที่เลือก
 *
 * @author Jirayu
 */
export async function getAccessControlByCamera(caa_camera_id: number) {
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

export async function creatAccessControl(){}

/**
 * อัพเดทข้อมูลของ Access Control
 *
 * @param {number} camId - รหัสของกล้อง
 * @param {string} selectedAccess - Access ที่ต้องการอัพเดท
 * @param {boolean} status - สถานะของ Acess
 * @returns {Promise<object>} Access Control object หลังอัพเดทเสร็จ
 *
 * @author Napat
 */
export async function updateAccessControl(camId: number, selectedAccess: string, status: boolean) {
    const { rows } = await pool.query(
      `
      UPDATE cameras_access
      SET ${selectedAccess} = $1
      WHERE caa_camera_id = $2
      RETURNING *;
      `,
      [status, camId]);
  
    const accessControl = rows[0];
  
    if (!accessControl) {
      throw new Error("Failed to update access control or not found");
    }
  
    return accessControl;
}

export async function softDeleteAccessControl(){}