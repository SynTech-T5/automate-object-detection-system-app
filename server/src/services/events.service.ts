import { pool } from '../config/db';

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