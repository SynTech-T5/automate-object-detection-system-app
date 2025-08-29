import CameraAccess from "@/app/components/CameraAccess";

export default function AccessControl() {
    return (
        <>
            <label
                htmlFor="AccessControl"
                className="min-w-0 flex-1 font-bold text-lg text-[var(--color-primary)] p-5"
            >
                Access Control
            </label>

            <CameraAccess />
        </>
    );
}