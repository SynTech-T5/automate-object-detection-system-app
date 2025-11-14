"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Pencil, Trash2, Plus, ArrowUpDown, ArrowUp, ArrowDown,
} from "lucide-react";
import * as Icons from "lucide-react";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DeleteConfirmModal } from "@/app/components/Utilities/AlertsPopup";
import BadgeUser from "@/app/components/Badges/BadgeUser";

/* ---------------------------------- Types --------------------------------- */
type Note = {
  note_id: number;
  creator_id: number;
  creator_username?: string | null;
  creator_name?: string | null;
  creator_role?: string | null;
  alert_id: number;
  note: string;
  note_created_at: string; // "YYYY-MM-DD HH:mm:ss" | ISO
  note_updated_at: string; // (ไม่แสดง)
};

type Me = { usr_id: number; usr_username: string; usr_email: string; usr_role?: string };

type SortKey = "id" | "user" | "note" | "created";
type SortOrder = "asc" | "desc" | null;

/* ------------------------------ Date Formatter ---------------------------- */
// "YYYY-MM-DD HH:mm"
function formatISOMinute(input: string, tz = "Asia/Bangkok") {
  if (!input) return "-";
  const d = new Date(input.replace(" ", "T"));
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? "";
  const yy = get("year");
  const mm = get("month");
  const dd = get("day");
  const hh = get("hour");
  const mi = get("minute");
  return `${yy}-${mm}-${dd} ${hh}:${mi}`;
}

/* -------------------------- Ghost→Full IconAction ------------------------- */
function IconAction({
  label,
  children,
  variant = "primary", // primary | danger | success
  onClick,
  disabled,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  variant?: "primary" | "danger" | "success";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const palette =
    variant === "danger"
      ? {
          border: "border-[var(--color-danger)]",
          text: "text-[var(--color-danger)]",
          hoverBg: "hover:bg-[var(--color-danger)]",
          focusRing: "focus:ring-[var(--color-danger)]",
        }
      : variant === "success"
      ? {
          border: "border-[var(--color-success)]",
          text: "text-[var(--color-success)]",
          hoverBg: "hover:bg-[var(--color-success)]",
          focusRing: "focus:ring-[var(--color-success)]",
        }
      : {
          border: "border-[var(--color-primary)]",
          text: "text-[var(--color-primary)]",
          hoverBg: "hover:bg-[var(--color-primary)]",
          focusRing: "focus:ring-[var(--color-primary)]",
        };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            className={[
              "inline-flex items-center justify-center h-8 w-8 rounded-full",
              "bg-transparent border", palette.border, palette.text,
              palette.hoverBg, "hover:text-white", "hover:border-transparent",
              "transition focus:outline-none focus:ring-2 focus:ring-offset-2", palette.focusRing,
              "disabled:opacity-50 disabled:cursor-not-allowed",
              className,
            ].join(" ")}
          >
            {children}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* -------------------------------- Component ------------------------------- */
export default function Notes({ alrId }: { alrId: number }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // current user (for POST user_id)
  const [me, setMe] = useState<Me | null>(null);

  // sort state
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  // Add (AlertDialog – ไม่มีปุ่ม X)
  const [openAdd, setOpenAdd] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [adding, setAdding] = useState(false);

  // Edit (AlertDialog – ไม่มีปุ่ม X)
  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editVal, setEditVal] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete confirm modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);
  const [busyDelete, setBusyDelete] = useState(false);

  /* -------------------------------- Fetch -------------------------------- */
  async function fetchNotes() {
    try {
      setLoading(true);
      setErr(null);
      const res = await fetch(`/api/alerts/${alrId}/notes`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
      const rows: Note[] = Array.isArray(json?.data) ? json.data : [];
      setNotes(rows);
    } catch (e: any) {
      setErr(e?.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }

  // load notes + current user
  useEffect(() => { fetchNotes(); }, [alrId]);
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => (r.ok ? r.json() : null))
      .then(setMe)
      .catch(() => setMe(null));
  }, []);

  /* -------------------------------- Add ---------------------------------- */
  async function addNote() {
    if (!newNote.trim()) return;
    if (!me?.usr_id) {
      alert("Please sign in first.");
      return;
    }
    try {
      setAdding(true);
      // POST /api/alerts/:alr_id/notes  { user_id, note }
      const res = await fetch(`/api/alerts/${alrId}/notes`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: me.usr_id, note: newNote.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Add note failed");
      setNewNote("");
      setOpenAdd(false);
      fetchNotes();
    } catch (e: any) {
      alert(e?.message || "Add note failed");
    } finally {
      setAdding(false);
    }
  }

  /* -------------------------------- Edit --------------------------------- */
  function openEditModal(n: Note) {
    setEditId(n.note_id);
    setEditVal(n.note);
    setOpenEdit(true);
  }

  async function saveEdit() {
    if (!editId) return;
    try {
      setSavingEdit(true);
      // PUT /api/alerts/notes/:anh_id  { note }
      const res = await fetch(`/api/alerts/notes/${editId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: editVal }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Update note failed");
      setOpenEdit(false);
      setEditId(null);
      setEditVal("");
      fetchNotes();
    } catch (e: any) {
      alert(e?.message || "Update note failed");
    } finally {
      setSavingEdit(false);
    }
  }

  /* ------------------------------- Delete -------------------------------- */
  function askDelete(n: Note) {
    setDeleteTarget(n);
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      setBusyDelete(true);
      // PATCH /api/alerts/notes/:anh_id
      const res = await fetch(`/api/alerts/notes/${deleteTarget.note_id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Delete note failed");
      setDeleteOpen(false);
      setDeleteTarget(null);
      fetchNotes();
    } catch (e: any) {
      alert(e?.message || "Delete note failed");
    } finally {
      setBusyDelete(false);
    }
  }

  /* -------------------------------- Sort --------------------------------- */
  const handleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortOrder("asc");
    } else {
      if (sortOrder === "asc") setSortOrder("desc");
      else if (sortOrder === "desc") setSortOrder(null);
      else setSortOrder("asc");
    }
  };

  const getComparable = (n: Note, key: SortKey) => {
    switch (key) {
      case "id":      return n.note_id;
      case "user":    return (n.creator_username || n.creator_name || "").toLowerCase();
      case "note":    return (n.note ?? "").toLowerCase();
      case "created": return new Date(n.note_created_at.replace(" ", "T")).getTime();
      default:        return 0;
    }
  };

  const sortedNotes = useMemo(() => {
    if (!sortKey || !sortOrder) return notes;
    return [...notes].sort((a, b) => {
      const A = getComparable(a, sortKey);
      const B = getComparable(b, sortKey);
      if (A < B) return sortOrder === "asc" ? -1 : 1;
      if (A > B) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [notes, sortKey, sortOrder]);

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key || !sortOrder) return <ArrowUpDown className="w-4 h-4 ml-1 inline-block" />;
    if (sortOrder === "asc")  return <ArrowUp className="w-4 h-4 ml-1 inline-block" />;
    if (sortOrder === "desc") return <ArrowDown className="w-4 h-4 ml-1 inline-block" />;
  };

  /* -------------------------------- Render -------------------------------- */
  if (loading) return <div className="text-sm text-gray-500">Loading notes…</div>;
  if (err)     return <div className="text-sm text-red-600">Error: {err}</div>;

  return (
    <div className="space-y-4">
      {/* Header + Add */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Notes</h2>

        {/* Add Note (AlertDialog, ไม่มีปุ่ม X) */}
        <AlertDialog open={openAdd} onOpenChange={setOpenAdd}>
          <AlertDialogTrigger asChild>
            <Button
              className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)]"
              disabled={!me?.usr_id}
              title={!me?.usr_id ? "Please sign in first" : undefined}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Note
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="sm:max-w-md [&>button:last-child]:hidden">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[var(--color-primary)]">Add Note</AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground">
                Create a new note for this alert.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-3 mt-2">
              <label className="text-sm font-medium">Note</label>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={4}
                placeholder="Enter note..."
                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpenAdd(false)}>Cancel</Button>
                <Button
                  onClick={addNote}
                  disabled={adding || !newNote.trim() || !me?.usr_id}
                  className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)]"
                >
                  {adding ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Table */}
      <Table className="w-full table-auto">
        <TableHeader>
          <TableRow className="border-b border-[var(--color-primary)]">
            <TableHead onClick={() => handleSort("id")} className="cursor-pointer select-none text-[var(--color-primary)]">
              <div className="flex items-center justify-between pr-3 border-r border-[var(--color-primary)] w-full">
                <span>ID</span>
                {renderSortIcon("id")}
              </div>
            </TableHead>

            <TableHead onClick={() => handleSort("user")} className="cursor-pointer select-none text-[var(--color-primary)]">
              <div className="flex items-center justify-between pr-3 border-r border-[var(--color-primary)] w-full">
                <span>User</span>
                {renderSortIcon("user")}
              </div>
            </TableHead>

            <TableHead onClick={() => handleSort("note")} className="cursor-pointer select-none text-[var(--color-primary)]">
              <div className="flex items-center justify-between pr-3 border-r border-[var(--color-primary)] w-full">
                <span>Note</span>
                {renderSortIcon("note")}
              </div>
            </TableHead>

            <TableHead onClick={() => handleSort("created")} className="cursor-pointer select-none text-[var(--color-primary)]">
              <div className="flex items-center justify-between pr-3 border-r border-[var(--color-primary)] w-full">
                <span>Created At</span>
                {renderSortIcon("created")}
              </div>
            </TableHead>

            <TableHead className="text-[var(--color-primary)]">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {!sortedNotes.length ? (
            <TableRow>
              <TableCell colSpan={5} className="py-4 text-center text-sm text-gray-500">
                No notes yet.
              </TableCell>
            </TableRow>
          ) : (
            sortedNotes.map((n) => {
              const userLabel = n.creator_username || n.creator_name || "-";
              return (
                <TableRow key={n.note_id} className="border-b last:border-b-0 align-top text-[12px]">
                  <TableCell className="py-3 font-medium text-black">{n.note_id}</TableCell>

                  <TableCell className="px-2 py-3 align-top text-left text-black">
                    <BadgeUser username={userLabel || undefined} role={n.creator_role} />
                  </TableCell>

                  <TableCell className="px-2 py-3 align-top text-left whitespace-pre-wrap break-words max-w-[48rem] text-black">
                    {n.note}
                  </TableCell>

                  <TableCell className="px-2 py-3 align-top text-left text-black">
                    {formatISOMinute(n.note_created_at)}
                  </TableCell>

                  <TableCell className="px-2 py-3 align-top text-left">
                    <div className="flex items-center gap-2">
                      <IconAction label="Edit" onClick={() => openEditModal(n)}>
                        <Pencil className="h-4 w-4" />
                      </IconAction>

                      <IconAction
                        label="Delete"
                        variant="danger"
                        onClick={() => {
                          if (busyDelete) return;
                          askDelete(n);
                        }}
                        disabled={busyDelete && deleteTarget?.note_id === n.note_id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconAction>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Edit Note */}
      <AlertDialog open={openEdit} onOpenChange={setOpenEdit}>
        <AlertDialogContent className="sm:max-w-md [&>button:last-child]:hidden">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[var(--color-primary)]">Edit Note</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Update the note content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 mt-2">
            <label className="text-sm font-medium">Note</label>
            <textarea
              value={editVal}
              onChange={(e) => setEditVal(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)]"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpenEdit(false)}>Cancel</Button>
              <Button
                onClick={saveEdit}
                disabled={savingEdit || !editVal.trim()}
                className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)]"
              >
                {savingEdit ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        open={deleteOpen}
        onOpenChange={(v) => {
          if (busyDelete) return;
          setDeleteOpen(v);
          if (!v) setDeleteTarget(null);
        }}
        title="Delete Note?"
        description="This action cannot be undone."
        confirmText={busyDelete ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={() => !busyDelete && confirmDelete()}
      />
    </div>
  );
}