import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import client from "../api/client"

function Register() {
    const [form, setForm] = useState({
        email: "",
        username: "",
        password: "",
        role: "contributor"
    })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        try {
            await client.post("/auth/register", form)
            navigate("/login")
        } catch (err) {
            setError(err.response?.data?.detail || "Registration failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="font-heading text-4xl font-semibold text-ink-900 mb-2">Kinyurite</h1>
                    <p className="text-ink-500 text-sm">Where stories are built in branches, not isolation.</p>
                </div>

                <Card className="border-ink-200">
                    <CardHeader>
                        <CardTitle className="font-heading text-xl">Create account</CardTitle>
                        <CardDescription>Join the community. Start writing or curating.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-md mb-4">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    placeholder="yourname"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="role">I want to</Label>
                                <select
                                    id="role"
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="contributor">Contribute to stories</option>
                                    <option value="lead_author">Curate my own story</option>
                                </select>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Creating account..." : "Create account"}
                            </Button>
                        </form>
                        <p className="text-center text-sm text-ink-500 mt-4">
                            Already have an account?{" "}
                            <Link to="/login" className="text-ink-900 underline underline-offset-4 hover:text-ink-600">
                                Sign in
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default Register