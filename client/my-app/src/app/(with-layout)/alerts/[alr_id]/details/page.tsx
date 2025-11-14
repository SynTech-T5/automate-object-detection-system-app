import { Alert } from "@/app/models/alerts.model";
import AlertDetails from '@/app/components/Alerts/Details/AlertDetails'

const base = process.env.NEXT_PUBLIC_APP_URL!;

export default async function Page({ params }: { params: Promise<{ alr_id: string }> }) {
    const { alr_id } = await params

    const res = await fetch(`${base}/api/alerts/${alr_id}`, { cache: "no-store" });
    if (!res.ok) {
        throw new Error("Failed to load alert");
    }

    const json = await res.json();
    const alert: Alert = json.data;

    return (
        <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
                <AlertDetails alert={alert} />
            </div>
        </div>
    )
}