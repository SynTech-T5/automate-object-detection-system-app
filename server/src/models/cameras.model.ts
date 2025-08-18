export interface CamerasRow{
    cam_id: number;
    cam_name: string;
    cam_address: string;
    cam_type: string;
    cam_resolution: string;
    cam_description: string;
    cam_installation_date: Date;
    cam_health: number;
    cam_video_quality: number;
    cam_network_latency: number;
    cam_is_use: boolean;
    cam_location_id: number;
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