import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import client from "../api/client"

function Register() {
    const [form, setForm] = useState({
        email: "",
        username: "",
        password: "",
        role: "contributor"
    })
    const [error, setError] = useState("")
    const navigate = useNavigate()

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            await client.post("/auth/register", form)
            navigate("/login")
        } catch (err) {
            setError(err.response?.data?.detail || "Registration failed")
        }
    }

    return (
        <div style={{ maxWidth: 400, margin: "100px auto", padding: "2rem" }}>
            <h1 style={{ marginBottom: "1.5rem" }}>Kinyurite</h1>
            <h2 style={{ marginBottom: "1rem", fontWeight: 400 }}>Create account</h2>
            {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: 4 }}>Email</label>
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
                    />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: 4 }}>Username</label>
                    <input
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
                    />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: 4 }}>Password</label>
                    <input
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
                    />
                </div>
                <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", marginBottom: 4 }}>Role</label>
                    <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
                    >
                        <option value="contributor">Contributor</option>
                        <option value="lead_author">Lead Author</option>
                    </select>
                </div>
                <button type="submit" style={{ width: "100%", padding: "10px" }}>
                    Create account
                </button>
            </form>
            <p style={{ marginTop: "1rem", textAlign: "center" }}>
                Already have an account? <Link to="/login">Sign in</Link>
            </p>
        </div>
    )
}

export default Register