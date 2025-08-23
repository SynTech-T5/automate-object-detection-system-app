import AlertTable, { type Alert } from "../../components/AlertTable";
import * as StatusCard from "../../components/StatusCard";

const base = process.env.NEXT_PUBLIC_APP_URL!;

export default async function AlertsPage() {
    const res = await fetch(`${base}/api/alerts`, {
        cache: "no-store",
        credentials: "include",
        method: "GET",
    });

    if (!res.ok) {
        throw new Error(`Failed to load alerts (${res.status})`);
    }

    const alerts: Alert[] = await res.json();

    return (
        <div className="space-y-6">
            <StatusCard.DashboardSummaryAlertSection></StatusCard.DashboardSummaryAlertSection>

            <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
                <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
                    <AlertTable alerts={alerts} />
                </div>
            </div>
        </div>
    );
}
