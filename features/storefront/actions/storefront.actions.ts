import { backendFetch, backendJSON } from "@/lib/backend"
import { getAccessToken } from "@/lib/auth"
"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"