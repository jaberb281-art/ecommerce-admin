import axios from "axios"
import Cookies from "js-cookie"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

const apiClient = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
})

// Attach JWT token to every request
apiClient.interceptors.request.use((config) => {
    const token = Cookies.get("access_token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Redirect to login on 401
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            Cookies.remove("access_token")
            window.location.href = "/login"
        }
        return Promise.reject(error)
    }
)

export default apiClient