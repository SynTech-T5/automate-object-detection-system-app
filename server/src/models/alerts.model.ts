export interface Alert {
    alr_id: number
    alr_severity: string;
    alr_create_date: Date;
    alr_status: string;
    alr_is_use: boolean;
    alr_camera_id: number;
    alr_footage_id: number;
    alr_event_id: number;
    alr_description: string;
}