'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import LogoutButton from "../components/LogoutButton";

export default function AlertsPage() {
    const onConfirm = () => {
        window.location.href = "/cameras"; // เปลี่ยนเส้นทางไปยังหน้า cameras
        // TODO: เรียก API / ทำงานที่ต้องการ
    };

    return (
        <div>
            <h1>Alerts Page</h1>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button className="bg-[#0077FF] text-white hover:bg-[#0063d6]">
                        Show Dialog
                    </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>You want to go to the Cameras menu, sure?</AlertDialogTitle>
                        <AlertDialogDescription>…</AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-gray-300 hover:bg-gray-50">
                            Cancel
                        </AlertDialogCancel>

                        {/* ไม่ต้อง asChild ก็ได้ ใส่ onClick ตรงนี้เลย จะปิด dialog ให้เอง */}
                        <AlertDialogAction
                            className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] "
                            onClick={onConfirm}
                        >
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <LogoutButton></LogoutButton>
        </div>
    )
};