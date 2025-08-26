export type EventSensitivity = "Low" | "Medium" | "High" | "Critical";
export type EventItem = {
    id: string | number;
    icon?: string; // lucide icon name from API
    name: string;
    description?: string;
    status: boolean; // use status for switch binding
    is_use: boolean;
    sensitivity: EventSensitivity;
};