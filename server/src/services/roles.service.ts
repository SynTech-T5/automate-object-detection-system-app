import { pool } from '../config/db';
import { RoleRow } from '../models/roles.model';

// export async function getRoleIdByName(roleName: string): Promise<number> {
//     const { rows } = await pool.query<{ rol_id: number }>(
//       `SELECT rol_id FROM roles WHERE rol_name = $1`,
//       [roleName]
//     );
//     if (!rows[0]) throw new Error(`Role not found: ${roleName}`);
//     return rows[0].rol_id;
// }