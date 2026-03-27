export const runtime = "nodejs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import axios from "axios"

const API_BASE =
    (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3000").replace(/\/$/, "")
const API_URL = `${API_BASE}/api`

export async function POST(req: Request) {
    const cookieStore = await cookies()
    const token = cookieStore.get("access_token")?.value || cookieStore.get("token")?.value

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()

    const file = formData.get("file") as File
    if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const backendFormData = new FormData()
    backendFormData.append("file", file)

    try {
        const { data } = await axios.post(
            `${API_URL}/products/upload-image`,
            backendFormData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            }
        )

        return NextResponse.json({ url: data.url })
    } catch (err: any) {
        return NextResponse.json(
            { error: err.response?.data?.message || "Upload failed" },
            { status: 500 }
        )
    }
}
