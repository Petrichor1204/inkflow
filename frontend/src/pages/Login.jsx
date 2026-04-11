import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import client from "../api/client"

function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            const res = await client.post("/auth/login", { email, password })
            localStorage.setItem("token", res.data.access_token)
            navigate("/stories")
        } catch (err) {
            setError("Invalid email or password")
        }
    }

    return (
        <div style={{ maxWidth: 400, margin: "100px auto", padding: "2rem" }}>
            <h1 style={{ marginBottom: "1.5rem" }}>Kinyurite</h1>
            <h2 style={{ marginBottom: "1rem", fontWeight: 400 }}>Sign in</h2>
            {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: 4 }}>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
                    />
                </div>
                <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", marginBottom: 4 }}>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
                    />
                </div>
                <button type="submit" style={{ width: "100%", padding: "10px" }}>
                    Sign in
                </button>
            </form>
            <p style={{ marginTop: "1rem", textAlign: "center" }}>
                No account? <Link to="/register">Register</Link>
            </p>
        </div>
    )
}

export default Login