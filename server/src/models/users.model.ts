export interface UserRow {
    usr_id: number;
    usr_username: string;
    usr_email: string;
    usr_password: string;
    usr_create_date: Date;
    usr_is_use: boolean;
    usr_role: string;
}

export interface UserSafe {
    usr_id: number;
    usr_username: string;   
    usr_email: string;
    usr_role: string;
}