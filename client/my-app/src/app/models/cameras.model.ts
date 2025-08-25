export interface Camera {
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
    last_maintenance_date: string;
    last_maintenance_time: string;
}