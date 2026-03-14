"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, Eye, EyeOff, MapPin, Calendar, Loader2, X, Zap } from "lucide-react"
import { format } from "date-fns"
import { createEvent, updateEvent, deleteEvent, toggleEventPublish } from "../actions/events.actions"

interface Event {
    id: string
    title: string
    description?: string
    location: string
    venue?: string
    city: string
    startDate: string
    endDate?: string
    image?: string
    status: "UPCOMING" | "ONGOING" | "PAST" | "CANCELLED"
    isPublished: boolean
}

const EMPTY_FORM = {
    title: "",
    description: "",
    location: "",
    venue: "",
    city: "Bahrain",
    startDate: "",
    endDate: "",
    image: "",
    status: "UPCOMING" as Event["status"],
    isPublished: false,
}

const STATUS_COLORS = {
    UPCOMING: "bg-blue-50 text-blue-700",
    ONGOING: "bg-emerald-50 text-emerald-700",
    PAST: "bg-slate-100 text-slate-500",
    CANCELLED: "bg-red-50 text-red-600",
}

export function EventsClient({ initialEvents }: { initialEvents: Event[] }) {
    const router = useRouter()
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<Event | null>(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState("")

    function openCreate() {
        setEditing(null)
        setForm(EMPTY_FORM)
        setError("")
        setShowModal(true)
    }

    function openEdit(event: Event) {
        setEditing(event)
        setForm({
            title: event.title,
            description: event.description || "",
            location: event.location,
            venue: event.venue || "",
            city: event.city,
            startDate: event.startDate.slice(0, 16),
            endDate: event.endDate ? event.endDate.slice(0, 16) : "",
            image: event.image || "",
            status: event.status,
            isPublished: event.isPublished,
        })
        setError("")
        setShowModal(true)
    }

    function closeModal() {
        setShowModal(false)
        setEditing(null)
        setForm(EMPTY_FORM)
        setError("")
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError("")
        startTransition(async () => {
            const result = editing
                ? await updateEvent(editing.id, form)
                : await createEvent(form)

            if (result.success) {
                closeModal()
                router.refresh()
            } else {
                setError(typeof result.error === "string" ? result.error : "Something went wrong")
            }
        })
    }

    function handleDelete(id: string) {
        if (!confirm("Delete this event?")) return
        startTransition(async () => {
            await deleteEvent(id)
            router.refresh()
        })
    }

    function handleToggle(id: string) {
        startTransition(async () => {
            await toggleEventPublish(id)
            router.refresh()
        })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Events</h1>
                    <p className="text-sm text-slate-500">Manage pop-ups, exhibitions & mall appearances</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
                >
                    <Plus size={16} />
                    New Event
                </button>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                {initialEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                            <Zap size={20} className="text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-600">No events yet</p>
                        <p className="text-xs text-slate-400 mt-1">Create your first event to get started</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="border-b border-slate-100 bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Event</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Published</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {initialEvents.map(event => (
                                <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-slate-900">{event.title}</p>
                                        {event.description && (
                                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{event.description}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1 text-slate-600">
                                            <MapPin size={12} className="text-slate-400" />
                                            <span>{event.venue ? `${event.venue}, ` : ""}{event.city}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1 text-slate-600">
                                            <Calendar size={12} className="text-slate-400" />
                                            <span>{format(new Date(event.startDate), "MMM d, yyyy")}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[event.status]}`}>
                                            {event.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleToggle(event.id)}
                                            disabled={isPending}
                                            className={`flex items-center gap-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${event.isPublished ? "text-emerald-600 hover:text-emerald-700" : "text-slate-400 hover:text-slate-600"}`}
                                        >
                                            {event.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                                            {event.isPublished ? "Live" : "Draft"}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEdit(event)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                                                <Pencil size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(event.id)} disabled={isPending} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h2 className="font-semibold text-slate-900">{editing ? "Edit Event" : "New Event"}</h2>
                            <button onClick={closeModal} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            {error && (
                                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                                    {error}
                                </div>
                            )}
                            <div>
                                <label className="text-xs font-medium text-slate-600 mb-1 block">Title *</label>
                                <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="e.g. City Centre Pop-up" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600 mb-1 block">Description</label>
                                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none" placeholder="What's happening at this event?" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-600 mb-1 block">Venue</label>
                                    <input value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="e.g. City Centre Mall" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-600 mb-1 block">City</label>
                                    <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="Bahrain" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600 mb-1 block">Location / Address *</label>
                                <input required value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="e.g. Level 2, North Entrance" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-600 mb-1 block">Start Date *</label>
                                    <input required type="datetime-local" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-600 mb-1 block">End Date</label>
                                    <input type="datetime-local" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-600 mb-1 block">Status</label>
                                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Event["status"] }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900">
                                        <option value="UPCOMING">Upcoming</option>
                                        <option value="ONGOING">Ongoing</option>
                                        <option value="PAST">Past</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <label className="flex items-center gap-2 cursor-pointer pb-2">
                                        <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} className="w-4 h-4 rounded accent-slate-900" />
                                        <span className="text-sm font-medium text-slate-700">Publish immediately</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600 mb-1 block">Image URL</label>
                                <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="https://..." />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeModal} className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={isPending} className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                    {isPending && <Loader2 size={14} className="animate-spin" />}
                                    {editing ? "Save Changes" : "Create Event"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}