import axios, { type InternalAxiosRequestConfig } from "axios"

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
    headers: {
        "Content-Type": "application/json",
    },
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
    }
    return config
})

export default apiClient