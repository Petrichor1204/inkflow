import axios from "axios"

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
})

client.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// update frontend to store and use current user
export function decodeToken() {
    const token = localStorage.getItem("token")
    if (!token) return null
    try {
        const payload = token.split(".")[1]
        return JSON.parse(atob(payload))
    } catch {
        return null
    }
}
export default client