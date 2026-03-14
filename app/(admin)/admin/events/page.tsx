import { getEvents } from "@/features/events/queries/events.queries"
import { EventsClient } from "@/features/events/components/events-client"

export default async function EventsPage() {
    const events = await getEvents()
    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <EventsClient initialEvents={events} />
            </div>
        </div>
    )
}