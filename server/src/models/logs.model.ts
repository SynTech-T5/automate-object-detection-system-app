export interface Camera {
    log_id: number;
    user_id: number;
    camera_id: number;
    log_action: string;
    log_created_at: string;
}

export interface Alert {
    log_id: number;
    user_id: number;
    alert_id: number;
    log_action: string;
    log_created_at: string;
}