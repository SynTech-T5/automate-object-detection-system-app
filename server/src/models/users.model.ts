export interface UserRow {
  usr_id: number;
  usr_username: string;
  usr_email: string;
  usr_password: string;
  usr_is_use: boolean;
  role_name: string;
}

export interface UserSafe {
    usr_id: number;
    usr_username: string;   
    usr_email: string;
    usr_role: string;
}