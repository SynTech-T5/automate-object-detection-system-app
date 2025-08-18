export interface MaintenanceHistory {
    mnt_id: number;
    mnt_date: Date;
    mnt_type: MaintenanceType;
    mnt_technician: string;
    mnt_note: string;
    mnt_is_use: boolean;
    mnt_camera_id: number;
}

export enum MaintenanceType {
  RoutineCheck = "Routine Check",
  Repair = "Repair",
  Installation = "Installation"
}