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
}

export type CreateCameraInput = {
  cam_name: string | null;
  cam_address: string | null;
  cam_type: string | null;
  cam_resolution: string | null;
  cam_description: string | null;
  cam_installation_date: string | Date | null; 
  cam_health: number | null;
  cam_video_quality: number | null;
  cam_network_latency: number | null;
  cam_is_use: boolean | null;      
  cam_location_id: number | null;
};

export interface CameraStatus {
  total: number;
  active: number;
  inactive: number;
  avg_health: number;
}