export interface Alert {
    severity: string;
    alert_id: number;
    created_at: string;
    camera_id: number;
    camera_name: string;
    event_icon: string;
    event_name: string;
    location_name: string;
    alert_status: string;
    alert_description: string;
    alert_reason: string;
    footage_id: number; 
    footage_path: string;
    created_by: string;
}