"use client"

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    type TooltipProps,
} from "recharts"

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

interface DataPoint {
    date: string
    revenue: number
    orders: number
}

interface RevenueChartProps {
    data: DataPoint[]
}

// ------------------------------------------------------------------
// Custom Tooltip
// ------------------------------------------------------------------

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
    if (!active || !payload?.length) return null

    return (
        <div className="rounded-lg border bg-background p-3 shadow-md text-sm">
            <p className="font-medium text-foreground mb-1">{label}</p>
            <p className="text-emerald-600">
                Revenue: <span className="font-semibold">${payload[0]?.value?.toLocaleString()}</span>
            </p>
            <p className="text-blue-500">
                Orders: <span className="font-semibold">{payload[1]?.value}</span>
            </p>
        </div>
    )
}

// ------------------------------------------------------------------
// Chart
// ------------------------------------------------------------------

export function RevenueChart({ data }: RevenueChartProps) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />

                <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    className="fill-muted-foreground"
                    interval="preserveStartEnd"
                />

                <YAxis
                    yAxisId="revenue"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    className="fill-muted-foreground"
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    width={48}
                />

                <YAxis
                    yAxisId="orders"
                    orientation="right"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    className="fill-muted-foreground"
                    width={32}
                />

                <Tooltip content={<CustomTooltip />} />

                <Area
                    yAxisId="revenue"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                />

                <Area
                    yAxisId="orders"
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#ordersGradient)"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}