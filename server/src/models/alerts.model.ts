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






export interface Alert {
    id: number;
    severity: string;
    create_date: string;
    create_time: string;
    status: string;
    is_use: boolean;
    description: string;
    camera: {
        id: number;
        name: string;
        address: string;
        type: string;
        resolution: string;
        description: string;
        status: boolean;
        installation_date: string;
        installation_time: string;
        health: number;
        video_quality: number;
        network_latency: number;
        is_use: boolean;
        location: {
            id: number;
            name: string;
        }
    };
    footage: {
        id: number;
        url: string;
        start_ts: string;
        end_ts: string;
    };
    event: {
        id: number;
        icon: string;
        name: string;
        description: string;
        is_use: boolean;
    }
}

export interface AlertSafe {
    id: number;
    severity: string;
    create_date: string;
    create_time: string;
    status: string;
    is_use: boolean;
    description: string;
    camera_id: number;
    footage_id: number;
    event_id: number;
}

export interface AlertSafeDelete {
    id: number;
    is_use: boolean;
}

export interface LogItem {
    id: number;
    event_name: string;
    create_date: string;
    create_time: string;
    user_id: number;
};

export interface Log {
    alert_id: number;
    log: LogItem[];
};

export interface Related {
    event_id: number;
    alert: AlertSafe[];
}

export interface Note {
    alert_id: number;
    notes: NoteItem[];
}

export interface NoteItem {
    id: number;
    note: string;
    update_date: string;
    update_time: string;
    user_id: number;
}

export interface Trend {
    date: string;
    trend: TrendAlertItem[];
}

export interface TrendAlertItem {
    severity: string;
    count: number;
}

export interface AlertStatus {
    total: number;
    active: number;
    resolved: number;
    dismissed: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
}