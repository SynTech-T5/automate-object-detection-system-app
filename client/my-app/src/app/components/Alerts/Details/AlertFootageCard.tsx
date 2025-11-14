"use client";

import { FileVideo, Image as ImageIcon } from "lucide-react";

type Props = {
  footagePath?: string | null;
  title?: string;
};

const VIDEO_EXT = ["mp4", "mov", "mkv", "webm"];
const IMG_EXT = ["png", "jpg", "jpeg", "webp"];

function isVideo(path?: string) {
  const ext = path?.split(".").pop()?.toLowerCase();
  return !!ext && VIDEO_EXT.includes(ext);
}
function isImage(path?: string) {
  const ext = path?.split(".").pop()?.toLowerCase();
  return !!ext && IMG_EXT.includes(ext);
}
function mediaURL(path?: string) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export default function AlertFootageCard({ footagePath, title = "Footage" }: Props) {
  const url = mediaURL(footagePath || undefined);
  const showVideo = isVideo(footagePath || undefined);
  const showImage = !showVideo && isImage(footagePath || undefined);

  return (
    <div className="rounded-lg border border-[var(--color-primary-bg)] bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--color-primary-bg)] flex items-center gap-2">
        {showVideo ? (
          <FileVideo className="w-4 h-4 text-[var(--color-primary)]" />
        ) : (
          <ImageIcon className="w-4 h-4 text-[var(--color-primary)]" />
        )}
        <div className="font-medium text-[var(--color-primary)]">{title}</div>
      </div>

      <div className="p-3">
        {!footagePath ? (
          <div className="h-56 grid place-items-center text-sm text-gray-500">
            No footage attached.
          </div>
        ) : showVideo ? (
          <video src={url} className="w-full max-h-[420px] rounded-md" controls playsInline />
        ) : showImage ? (
          <img src={url} alt="Alert Footage" className="w-full max-h-[420px] object-contain rounded-md" />
        ) : (
          <div className="h-56 grid place-items-center text-sm text-gray-500">
            Unsupported file: <span className="ml-1 font-mono">{footagePath}</span>
          </div>
        )}

        {footagePath && (
          <div className="mt-3 text-xs text-gray-500 break-all">
            Source:{" "}
            <a href={url} target="_blank" className="underline text-[var(--color-primary)]">
              {footagePath}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
