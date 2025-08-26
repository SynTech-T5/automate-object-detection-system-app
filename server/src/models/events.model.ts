export interface Events {
    id: number;
    icon: string;
    name: string;
    description: string;
    is_use: boolean;
}

export interface EventSafeDelete {
    id: number;
    is_use: boolean;
}