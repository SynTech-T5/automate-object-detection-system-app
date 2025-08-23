"use client";

import React from "react";
import { MoreVertical, Clock5 } from "lucide-react";
import { format, parseISO } from "date-fns";

/* -------------------- Types -------------------- */
export interface Note {
  anh_id: number;
  anh_note: string;
  anh_is_use: 0 | 1;
  anh_update_date: string;
  anh_user_id: number;
  anh_alert_id: number;
  user?: USER;   
}

export interface USER {
  usr_id: number;
  usr_username: string;
  usr_role_id: number;
  role?: ROLE;   
}

export interface ROLE {
  rol_id: number;
  rol_name: string;
}

/* -------------------------- fetch helper hook ---------------------------- */
function useFetchJson<T>(url: string) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(url, { cache: "no-store", signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as T;
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled && e?.name !== "AbortError") setError(e?.message ?? "fetch error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [url]);

  return { data, loading, error };
}

/* -------------------- NoteCard Component -------------------- */
const NoteCard: React.FC<{ note: Note }> = ({ note }) => {
  const dateObject = parseISO(note.anh_update_date);
  const formattedDate = format(dateObject, "dd-MM-yyyy HH:mm:ss");
  const user = note.user;
  const role = user?.role;

  return (
    <div className="min-h-[100px] w-[400px] bg-white border border-gray-400 rounded-[10px] shadow-sm p-4 flex flex-col gap-2">
      {/* แถวบน */}
      <div className="flex justify-between items-center">
        {/* ซ้าย Avatar + ชื่อ/Role */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Avatar */}
          <div className="w-[30px] h-[30px] rounded-full bg-gray-200 flex items-center justify-center text-[var(--color-gray-500)] font-medium">
            {user?.usr_username ? user.usr_username[0].toUpperCase() : "?"}
          </div>
          <p className="text-[14px] font-medium text-[#0077FF] truncate">
            {role?.rol_name === "System" || user?.usr_username === "system"
              ? "System"
              : `${role ? role.rol_name : "System"} | ${user?.usr_username ? user.usr_username[0].toUpperCase() + user.usr_username.slice(1) : ""}`}
          </p>
        </div>

        {/* ขวา รูปนาฬิกา + เวลา + ปุ่มเมนู */}
        <div className="flex items-center gap-2 text-[#000000] flex-shrink-0">
          <Clock5 className="w-[12px] h-[12px] text-[var(--color-gray-500)]" />
          <p className="text-[10px] font-regular whitespace-nowrap">{formattedDate}</p>
          <button className="p-1">
            <MoreVertical size={16} className="text-[var(--color-gray-500)]" />
          </button>
        </div>
      </div>

      {/* เนื้อหาโน้ต */}
      <p className="text-[#000000] text-[10px] mt-1.5 font-light whitespace-pre-line break-words">
        {note.anh_note}
      </p>
    </div>

  );
};


/* -------------------- NoteList Component ที่จะส่งข้อมูลไฟให้ NoteCard Component-------------------- */
interface NoteListProps {
  alertId: number; // ID ของ alert ที่ต้องการแสดง note
}


export const NoteList: React.FC<NoteListProps> = ({ alertId }) => {

    // -------------------ดึงข้อมูลจริง------------------------//
  // ใช้ alertId ดึง note ของ alert นั้น
  // const apiPath = `/api/alerts/${alertId}/notes`;

  // const { data: notes, loading, error } = useFetchJson<Note[]>(apiPath);


  // ----- -ข้อมูลจำลอง ----- //
  const mockNotes: Note[] = [
    {
      anh_id: 1,
      anh_alert_id: alertId,
      anh_note: "ตรวจพบเหตุการณ์ผิดปกติที่ประตูทางเข้า",
      anh_is_use: 1,
      anh_update_date: "2025-08-22 09:30:00",
      anh_user_id: 101,
      user: { usr_id: 101, usr_username: "nopp", usr_role_id: 1, role: { rol_id: 1, rol_name: "Admin" } },
    },
    {
      anh_id: 2,
      anh_alert_id: alertId,
      anh_note: "กล้องห้องประชุม A offline ชั่วคราว",
      anh_is_use: 0,
      anh_update_date: "2025-08-21 15:45:00",
      anh_user_id: 102,
      user: { usr_id: 102, usr_username: "win", usr_role_id: 2, role: { rol_id: 2, rol_name: "Staff" } },
    },
    {
      anh_id: 3,
      anh_alert_id: alertId,
      anh_note: "ผู้ใช้งานเพิ่ม note ใหม่ทดสอบระบบ",
      anh_is_use: 1,
      anh_update_date: "2025-08-22 12:10:00",
      anh_user_id: 103,
      user: { usr_id: 103, usr_username: "system", usr_role_id: 2, role: { rol_id: 2, rol_name: "System" } },
    },
    {
      anh_id: 4,
      anh_alert_id: alertId,
      anh_note: "ตรวจสอบไฟล์วิดีโอย้อนหลังเรียบร้อย But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?",
      anh_is_use: 1,
      anh_update_date: "2025-08-20 08:20:00",
      anh_user_id: 101,
      user: { usr_id: 101, usr_username: "nopp", usr_role_id: 1, role: { rol_id: 1, rol_name: "Admin" } },
    },
    {
      anh_id: 5,
      anh_alert_id: alertId,
      anh_note: "ระบบแจ้งเตือนซ้ำหลายครั้ง ต้องรีเซ็ต",
      anh_is_use: 0,
      anh_update_date: "2025-08-19 18:00:00",
      anh_user_id: 104,
      user: { usr_id: 104, usr_username: "kawin", usr_role_id: 3, role: { rol_id: 3, rol_name: "Security" } },
    },
  ];



  const notes = mockNotes; // ของ mock data  

  // if (loading) return <p>กำลังโหลดบันทึก...</p>;
  // if (error) return <p className="text-red-500">เกิดข้อผิดพลาด: {error}</p>;
  if (!notes || notes.length === 0) return <p>ยังไม่มีบันทึกสำหรับแจ้งเตือนนี้</p>;

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <NoteCard key={note.anh_id} note={note} />
      ))}
    </div>
  );
};





