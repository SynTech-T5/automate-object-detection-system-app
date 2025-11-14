export interface ResponsePostCamera {
  camera_id: number;
  creator_id: number;
  location_id: number;
  camera_name: string;
  source_type: string;
  source_value: string;
  camera_type: string;
  camera_status: boolean;
  camera_description: string;
  camera_created_date: string;
  camera_created_time: string;
  camera_updated_date: string;
  camera_updated_time: string;
  camera_is_use: boolean;
}

export interface ResponseEventDetection {
  detection_id: number;
  detection_event_id: number;
  event_name: string;
  event_icon: string; 
  camera_id: number;
  detection_sensitivity: string;
  detection_priority: string;
  detection_updated_date: string;
  detection_updated_time: string;
  detection_status: boolean;
}

export interface ResponseMaintenance {
  maintenance_id: number;
  camera_id: number;
  maintenance_date: string;
  maintenance_type: string;
  maintenance_technician: string;
  maintenance_note: string;
  maintenance_created_date: string;
  maintenance_created_time: string;
}

export interface ResponsePermission {
  permission_id: number;
  camera_id: number;
  permission_require_auth: boolean;
  permission_restrict: boolean;
  permission_log: boolean;
  permission_updated_date: string;
  permission_updated_time: string;
}