'use client';
import { useEffect, useState } from 'react';

type Me = { usr_id:number; usr_username:string; usr_email:string; usr_role?:string };

/**
 * คอมโพเนนต์สำหรับแสดงข้อความทักทายผู้ใช้
 * ถ้าเข้าสู่ระบบแล้วจะแสดงชื่อผู้ใช้ ถ้ายังไม่เข้าสู่ระบบจะแสดง "Guest"
 *
 * @returns {JSX.Element} คอมโพเนนต์ที่แสดงข้อความทักทาย
 */
export default function UserGreeting() {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(setMe)
      .catch(() => setMe(null));
  }, []);

  return <span>{me ? `Welcome, ${me.usr_username}` : 'Welcome, Guest'}</span>;
}