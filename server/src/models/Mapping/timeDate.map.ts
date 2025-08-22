/**
 * แยกวันและเวลาออกจาก ISO datetime
 * @param iso       เช่น "2025-08-17T12:36:46.788Z"
 * @param timeZone  เช่น "Asia/Bangkok"
 * @param withSeconds true = เวลา HH:mm:ss, false = เวลา HH:mm
 */
export function splitDateTime(
    iso: string,
    timeZone: string = 'Asia/Bangkok',
    withSeconds: boolean = true
): { date: string; time: string } {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
        return { date: '', time: '' }; // กันค่าไม่ถูกต้อง
    }

    // ใช้ en-CA เพื่อให้ได้ YYYY-MM-DD ตรง ๆ
    const date = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(d); // -> "2025-08-17"

    const time = new Intl.DateTimeFormat('en-GB', {
        timeZone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        ...(withSeconds ? { second: '2-digit' } : {}),
    }).format(d); // -> "19:36:46" หรือ "19:36"

    return { date, time };
}

// ตัวอย่างใช้
// splitDateTime("2025-08-17T12:36:46.788Z")
// => { date: "2025-08-17", time: "19:36:46" }  // เพราะ +07:00
