import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import client from "../api/client"

function Stories() {
    const [stories, setStories] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentUser, setCurrentUser] = useState(null)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [newStory, setNewStory] = useState({ title: "", description: "", genre: "" })
    const navigate = useNavigate()
    useEffect(() => {
        client.get("/auth/me")
            .then(res => setCurrentUser(res.data))
            .catch(() => {
                localStorage.removeItem("token")
                navigate("/login")
            })

        client.get("/stories/")
            .then(res => {
                setStories(res.data)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    function handleLogout() {
        localStorage.removeItem("token")
        navigate("/login")
    }
    async function handleCreateStory(e) {
        e.preventDefault()
        try {
            const res = await client.post("/stories/", newStory)
            setStories([...stories, res.data])
            setShowCreateForm(false)
            setNewStory({ title: "", description: "", genre: "" })
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to create story")
        }
    }
    if (loading) return <p style={{ padding: "2rem" }}>Loading...</p>

    return (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1>InkFlow</h1>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    {currentUser && (
                        <span style={{ fontSize: 14, color: "#888" }}>
                            {currentUser.username} · {currentUser.role}
                        </span>
                    )}
                    <button onClick={handleLogout}>Sign out</button>
                </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ fontWeight: 400, margin: 0 }}>Stories</h2>
                {currentUser?.role === "lead_author" && (
                    <button onClick={() => setShowCreateForm(!showCreateForm)}>
                        {showCreateForm ? "Cancel" : "+ New story"}
                    </button>
                )}
            </div>

            {showCreateForm && (
                <form onSubmit={handleCreateStory} style={{ border: "1px solid #eee", borderRadius: 8, padding: "1.25rem", marginBottom: "1.5rem" }}>
                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: 4, fontSize: 14 }}>Title</label>
                        <input
                            value={newStory.title}
                            onChange={e => setNewStory({ ...newStory, title: e.target.value })}
                            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: 4, fontSize: 14 }}>Genre</label>
                        <input
                            value={newStory.genre}
                            onChange={e => setNewStory({ ...newStory, genre: e.target.value })}
                            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
                        />
                    </div>
                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: 4, fontSize: 14 }}>Description</label>
                        <textarea
                            value={newStory.description}
                            onChange={e => setNewStory({ ...newStory, description: e.target.value })}
                            style={{ width: "100%", padding: "8px", boxSizing: "border-box", minHeight: 80 }}
                        />
                    </div>
                    <button type="submit">Create story</button>
                </form>
            )}

            {stories.length === 0 && <p>No stories yet.</p>}
            {stories.map(story => (
                <div key={story.id} style={{
                    border: "1px solid #eee",
                    borderRadius: 8,
                    padding: "1rem 1.25rem",
                    marginBottom: "1rem",
                    cursor: "pointer"
                }}>
                    <h3 style={{ margin: 0, marginBottom: 4 }}>{story.title}</h3>
                    <p style={{ margin: 0, color: "#888", fontSize: 14 }}>{story.genre}</p>
                    {story.description && (
                        <p style={{ margin: 0, marginTop: 8, fontSize: 14 }}>{story.description}</p>
                    )}
                </div>
            ))}
        </div>
    )
}

export default Stories