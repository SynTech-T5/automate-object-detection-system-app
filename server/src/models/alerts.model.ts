export interface Alerts {
    alert_id: number;
    creator_id: number;
    camera_id: number;
    footage_id: number;
    event_id: number;
    alert_severity: string;
    alert_status: string;
    alert_description: string;
    alert_created_at: string;
    alert_updated_at: string;
    alert_is_use: boolean;
}

export interface Logs {
    log_id: number;
    creator_id: number;
    creator_username: string;
    creator_name: string;
    creator_role: string;
    alert_id: number;
    action: string;
    created_at: string;
}

export interface Notes {
    note_id: number;
    creator_id: number;
    creator_username: string;
    creator_name: string;
    creator_role: string;
    alert_id: number;
    note: string;
    note_created_at: string;
    note_updated_at: string;
    note_is_use: boolean;
}