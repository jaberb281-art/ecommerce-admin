"use server"
import { backendFetch, backendJSON } from "@/lib/backend"
import { getAccessToken } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export async function getShopSettings() {
    try {
        const token = await getAccessToken();

        const response = await backendFetch("/shop/settings", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch shop settings");
        }

        return await response.json();
    } catch (error) {
        console.error("getShopSettings Error:", error);
        return null;
    }
}