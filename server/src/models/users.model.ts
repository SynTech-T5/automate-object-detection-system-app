export interface User {
    id: number;
    role_id: number;
    username: string;
    email: string;
    name: string;
    phone: string;
    profile_url: string;
    created_at: string;
    updated_at: string;
    is_use: boolean;
}

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
    usr_name: string;   
    usr_phone: string;   
    usr_email: string;
    usr_role: string;
}
