'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = { className?: string };

/**
 * ปุ่มสำหรับออกจากระบบ
 * @param {Object} props - พร็อพที่ส่งมาให้คอมโพเนนต์
 * @param {string} [props.className] - คลาสสำหรับสไตล์ปุ่ม
 * @returns {JSX.Element} ปุ่มออกจากระบบ
 */
export default function LogoutButton({ className = '' }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (_) {
      // เงียบ ๆ ก็ได้
    } finally {
      // เคลียร์ state แล้วพาไป login
      setLoading(false);
      // router.replace('/login');
      // router.refresh();
      window.location.href = '/login';
    }
  };

  return (
    <button
      onClick={onLogout}
      disabled={loading}
      className={`px-3 py-2 rounded-2xl border shadow-sm hover:bg-gray-50 disabled:opacity-60 ${className}`}
      title="ออกจากระบบ"
    >
      {loading ? 'กำลังออก...' : 'Logout'}
    </button>
  );
}
