export interface Events {
    event_id: number;
    event_name: string;
    icon_name: string;
    description: string;
    created_at: string;
    updated_at: string;
    event_is_use: boolean;
}

export interface GlobalEvents {
    event_id: number;
    event_name: string;
    icon_name: string;
    description: string;
    status: boolean;
    sensitivity: string;
    priority: string;
    updated_at: string;
}