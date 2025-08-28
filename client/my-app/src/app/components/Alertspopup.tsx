"use client";

import React, { useEffect, useRef, useState } from "react";
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
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Trash2, Pencil, AlertTriangle, WandSparkles, Info } from "lucide-react";

/**
 * Small hook to auto-resize <Textarea /> based on content
 */
function useAutosizeTextArea(textareaRef: HTMLTextAreaElement | null, value: string) {
  useEffect(() => {
    if (!textareaRef) return;
    textareaRef.style.height = "auto";
    textareaRef.style.height = textareaRef.scrollHeight + "px";
  }, [textareaRef, value]);
}

/**
 * Shared types
 */
export type BaseModalProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  /** If provided, wraps this node with a Trigger for easy usage */
  trigger?: React.ReactNode;
  /** Controlled state (optional). If omitted, component can still be used with Trigger. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type ConfirmDialogProps = BaseModalProps & {
  confirmText?: string;
  cancelText?: string;
  onConfirm: (payload: { input?: string; note?: string }) => void; // payload is NOT optional
  /** If provided, user must type EXACTLY this string to enable confirm */
  requireTextMatch?: string;
  /** Show a note textarea (returned via payload.note) */
  noteTextarea?: boolean;
  notePlaceholder?: string;
  /** Visual variant */
  variant?: "destructive" | "warning" | "default" | "success";
  /** Hide cancel button (single-action modal) */
  hideCancel?: boolean;
};

// 🎨 Variant tokens tuned to the reference image
const THEME: Record<NonNullable<ConfirmDialogProps["variant"]>, {
  outerRing: string;
  innerBg: string;
  iconColor: string;
  confirmBtn: string;
  disabledBtn: string;
}> = {
  destructive: {
    outerRing: "ring-red-200",
    innerBg: "bg-red-100",
    iconColor: "text-red-600",
    confirmBtn: "bg-red-600 text-white hover:bg-red-600/90",
    disabledBtn: "bg-red-300/60 text-white/80 cursor-not-allowed",
  },
  warning: {
    outerRing: "ring-yellow-200",
    innerBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    confirmBtn: "bg-yellow-400 text-black hover:bg-yellow-400/90",
    disabledBtn: "bg-yellow-300/60 text-yellow-950/70 cursor-not-allowed",
  },
  default: {
    outerRing: "ring-blue-200",
    innerBg: "bg-blue-100",
    iconColor: "text-blue-600",
    confirmBtn: "bg-blue-600 text-white hover:bg-blue-600/90",
    disabledBtn: "bg-blue-300/60 text-white/85 cursor-not-allowed",
  },
  success: {
    outerRing: "ring-green-200",
    innerBg: "bg-green-100",
    iconColor: "text-green-600",
    confirmBtn: "bg-green-600 text-white hover:bg-green-600/90",
    disabledBtn: "bg-green-300/60 text-white/85 cursor-not-allowed",
  },
};

const CONTENT_W = "w-full max-w-[360px]"; // title/input same width, a bit narrower like design // keep title/input same width

/**
 * ConfirmDialog — centered, clean card like the screenshot
 */
export function ConfirmDialog({
  title,
  description,
  icon,
  trigger,
  open,
  onOpenChange,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  requireTextMatch,
  noteTextarea,
  notePlaceholder = "Additional note...",
  variant = "default",
  hideCancel,
}: ConfirmDialogProps) {
  const [match, setMatch] = useState("");
  const [note, setNote] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useAutosizeTextArea(textareaRef.current, note);

  const t = THEME[variant];
  const isMatchOk = !requireTextMatch || match.trim() === requireTextMatch.trim();

  return (
    <AlertDialog
      open={open}
      onOpenChange={(v) => {
        if (!v) { setMatch(""); setNote(""); }  // เคลียร์ค่าทุกครั้งที่ปิด
        onOpenChange?.(v);
      }}
    >
      {trigger ? <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger> : null}

      <AlertDialogContent
        className={cn(
          // กว้างขึ้น, เตี้ยลง, จำกัดความสูงไม่ให้ยืด
          "rounded-2xl bg-white border border-slate-200 shadow-[0_6px_30px_rgba(0,0,0,0.06)] text-center",
          "px-6 py-4 overflow-y-auto",
          "!top-1/2 !-translate-y-1/2"
        )}
      >
        {/* ไอคอนบน: บาลานซ์ระยะให้เตี้ยลง */}
        <div
          className={cn(
            "mx-auto mb-2 grid place-items-center h-16 w-16 rounded-full bg-white ring-2 shadow-sm",
            t.outerRing
          )}
          style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
        >
          <div className={cn("grid place-items-center h-12 w-12 rounded-full", t.innerBg)}>
            {icon ?? <Info className={cn("h-7 w-7", t.iconColor)} />}
          </div>
        </div>

        <AlertDialogHeader className="p-0">
          {/* Title/Description และ input ใช้ความกว้างเดียวกัน */}
          <div className={cn("mx-auto w-full max-w-[480px]")}>
            <AlertDialogTitle className="text-lg font-semibold leading-tight tracking-tight">
              {title}
            </AlertDialogTitle>
            {description ? (
              <AlertDialogDescription className="mt-0.5 text-slate-500 leading-snug">
                {description}
              </AlertDialogDescription>
            ) : null}
          </div>
        </AlertDialogHeader>

        {requireTextMatch ? (
          <div className={cn("mt-3 text-left mx-auto w-full max-w-[480px]")}>
            <label className="text-xs text-slate-600">
              To confirm, type "<span className="font-medium">{requireTextMatch}</span>" in the box below
            </label>
            <Input
              value={match}
              onChange={(e) => setMatch(e.target.value)}
              placeholder={requireTextMatch}
              className="mt-2 h-9 text-sm border-slate-200"
            />
          </div>
        ) : null}

        {noteTextarea ? (
          <div className={cn("mt-2.5 text-left mx-auto w/full max-w-[480px]")}>
            <label className="text-xs text-slate-600">Note (optional)</label>
            <Textarea
              ref={textareaRef}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={notePlaceholder}
              className="mt-2 resize-none overflow-hidden border-slate-200 text-sm"
              rows={1}
            />
          </div>
        ) : null}

        {/* ปุ่มอยู่กลางจริง ๆ ทุก breakpoint (override ค่า default ของ shadcn) */}
        <AlertDialogFooter
          className="
            mt-3 sm:mt-4
            !flex !flex-row !justify-center sm:!justify-center !items-center
            gap-2 sm:gap-3
          "
        >
          {!hideCancel && (
            <AlertDialogCancel
              onClick={() => { setMatch(""); setNote(""); }}
              className="h-9 px-4 rounded-md border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
            >
              {cancelText}
            </AlertDialogCancel>
          )}
          <AlertDialogAction asChild>
            <button
              className={cn(
                "h-9 px-4 rounded-md text-sm font-medium",
                isMatchOk ? t.confirmBtn : t.disabledBtn // disabled ใช้โทนสีตามประเภท
              )}
              disabled={!isMatchOk}
              onClick={() =>
                onConfirm({ input: match || undefined, note: note || undefined })
              }
            >
              {confirmText}
            </button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Specializations with sensible defaults
 */
export function DeleteConfirmModal(
  props: Omit<ConfirmDialogProps, "variant" | "icon"> & { confirmWord?: string }
) {
  const { confirmWord, ...rest } = props;
  return (
    <ConfirmDialog
      variant="destructive"
      icon={<Trash2 className="h-7 w-7 text-red-600" />}
      confirmText={rest.confirmText ?? "Delete"}
      requireTextMatch={rest.requireTextMatch ?? confirmWord}
      {...rest}
    />
  );
}

export function SaveConfirmModal(props: Omit<ConfirmDialogProps, "variant" | "icon">) {
  return (
    <ConfirmDialog
      variant="default"
      icon={<Pencil className="h-7 w-7 text-blue-600" />}
      confirmText={props.confirmText ?? "Save"}
      {...props}
    />
  );
}

export function WarningModal(
  props: Omit<ConfirmDialogProps, "variant" | "icon" | "cancelText">
) {
  return (
    <ConfirmDialog
      variant="warning"
      icon={<AlertTriangle className="h-7 w-7 text-yellow-600" />}
      hideCancel={props.hideCancel ?? true}
      confirmText={props.confirmText ?? "Retry"}
      {...props}
    />
  );
}

export function SuccessModal(props: Omit<ConfirmDialogProps, "variant" | "icon">) {
  return (
    <ConfirmDialog
      variant="success"
      icon={<WandSparkles className="h-7 w-7 text-green-600" />}
      confirmText={props.confirmText ?? "Create"}
      {...props}
    />
  );
}

/**
 * FormModal — general purpose form container (create/edit)
 * Now supports submitVariant to color the Submit button by type
 */
export type FormModalProps = BaseModalProps & {
  submitText?: string;
  cancelText?: string;
  submitVariant?: "default" | "destructive" | "warning" | "success";
  onSubmit: () => void;
  children: React.ReactNode; // your form fields
  footerExtra?: React.ReactNode; // e.g., secondary actions
};

export function FormModal({
  title,
  description,
  icon,
  trigger,
  open,
  onOpenChange,
  submitText = "Submit",
  cancelText = "Cancel",
  submitVariant = "default",
  onSubmit,
  children,
  footerExtra,
}: FormModalProps) {
  const t = THEME[submitVariant];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}

      {/* กว้างขึ้น (640), padding ลดลงให้ดูเตี้ยลง, ตัวหนังสือกลาง */}
      <DialogContent className="
      rounded-2xl sm:max-w-[640px] px-7 py-5
      bg-white border border-slate-200
      shadow-[0_6px_30px_rgba(0,0,0,0.06)]
      !top-1/2 !-translate-y-1/2 text-center
    ">

        {/* ไอคอน: ระยะห่างบนล่างสั้นลง */}
        {icon ? (
          <div
            className="mx-auto mb-2 grid place-items-center h-16 w-16 rounded-full bg-white ring-2 ring-slate-200 shadow-sm"
            style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
          >
            <div className="h-12 w-12 grid place-items-center rounded-full bg-slate-100">
              {icon}
            </div>
          </div>
        ) : null}

        <DialogHeader className="p-0">
          {/* เพิ่มความกว้างคอนเทนต์ด้านใน เพื่อให้ไม่สูงเกิน */}
          <div className="mx-auto w-full max-w-[440px]">
            <DialogTitle className="text-lg font-semibold leading-tight tracking-tight">
              {title}
            </DialogTitle>
            {description ? (
              <DialogDescription className="mt-0.5 text-slate-500 leading-snug">
                {description}
              </DialogDescription>
            ) : null}
          </div>
        </DialogHeader>

        {/* เนื้อหาในฟอร์ม: ระยะแนวตั้งแน่นขึ้น */}
        <div className="mt-2 space-y-2 text-left mx-auto w-full max-w-[440px]">
          {children}
        </div>

        {/* ปุ่ม: กลาง, ระยะห่างลดลง, ขนาดปุ่มเท่ากัน */}
        <DialogFooter className="mt-3 sm:mt-4 flex-row justify-center gap-2">
          {footerExtra}
          <Button variant="outline" className="h-9 px-4 border-slate-200">
            {cancelText}
          </Button>
          <Button onClick={onSubmit} className={t.confirmBtn + " h-9 px-4"}>
            {submitText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Demo gallery — styled like the screenshot grid
 */
export default function ModalsGallery() {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [warnOpen, setWarnOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const camName = "cam_name";

  return (
    <div className="min-h-screen bg-[#EAF7FF] p-10">
      <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10 place-items-center">
        {/* Save */}
        <SaveConfirmModal
          open={saveOpen}
          onOpenChange={setSaveOpen}
          title="Update Account?"
          description={`Deleting your account is irreversible and will erase all your data.
This action cannot be undone.`}
          trigger={<Button variant="outline">Open Save</Button>}
          onConfirm={() => setSaveOpen(false)}
          confirmText="Save"
          cancelText="Cancel"
        />

        {/* Delete */}
        <DeleteConfirmModal
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete Camera?"
          description={`Deleting your camera is irreversible and will erase all your data.
This action cannot be undone.`}
          confirmWord={camName}
          trigger={<Button variant="outline">Open Delete</Button>}
          onConfirm={() => setDeleteOpen(false)}
          confirmText="Delete"
          cancelText="Cancel"
        />

        {/* Warning */}
        <WarningModal
          open={warnOpen}
          onOpenChange={setWarnOpen}
          title="Warning!!!"
          description={`Deleting your account is irreversible and will erase all your data.
This action cannot be undone.`}
          trigger={<Button variant="outline">Open Warning</Button>}
          onConfirm={() => setWarnOpen(false)}
          confirmText="Retry"
        />

        {/* Success */}
        <SuccessModal
          open={successOpen}
          onOpenChange={setSuccessOpen}
          title="Create Account"
          description={`Deleting your account is irreversible and will erase all your data.
This action cannot be undone.`}
          trigger={<Button variant="outline">Open Success</Button>}
          onConfirm={() => setSuccessOpen(false)}
          confirmText="Create"
        />

        {/* Form (Create / Edit) */}
        {/*
        <FormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          title="Create Account"
          description="Fill in the details to create a new account."
          trigger={<Button variant=\"outline\">Open Form</Button>}
          submitText="Create"
          submitVariant="success"
          onSubmit={() => setFormOpen(false)}
          icon={<WandSparkles className="h-7 w-7 text-green-600" />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm">First name</label>
              <Input placeholder="Jane" />
            </div>
            <div>
              <label className="text-sm">Last name</label>
              <Input placeholder="Doe" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm">About</label>
              <Textarea placeholder="Short bio…" rows={3} />
            </div>
          </div>
        </FormModal>
        */}
      </div>
    </div>
  );
}