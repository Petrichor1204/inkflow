import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import client from "../api/client"

function StoryDetail() {
    const { storyId } = useParams()
    const navigate = useNavigate()
    const [story, setStory] = useState(null)
    const [chapters, setChapters] = useState([])
    const [currentUser, setCurrentUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showChapterForm, setShowChapterForm] = useState(false)
    const [newChapter, setNewChapter] = useState({ title: "", body: "", order: 1 })

    useEffect(() => {
        Promise.all([
            client.get("/auth/me"),
            client.get(`/stories/${storyId}`),
            client.get(`/stories/${storyId}/chapters/`)
        ]).then(([userRes, storyRes, chaptersRes]) => {
            setCurrentUser(userRes.data)
            setStory(storyRes.data)
            setChapters(chaptersRes.data)
            setLoading(false)
        }).catch(() => {
            navigate("/stories")
        })
    }, [storyId])

    async function handleCreateChapter(e) {
        e.preventDefault()
        try {
            const res = await client.post(`/stories/${storyId}/chapters/`, newChapter)
            setChapters([...chapters, res.data])
            setShowChapterForm(false)
            setNewChapter({ title: "", body: "", order: chapters.length + 2 })
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to create chapter")
        }
    }

    if (loading) return <p style={{ padding: "2rem" }}>Loading...</p>

    const isLeadAuthor = currentUser?.role === "lead_author"
    const isOwner = story?.lead_author_id === currentUser?.id

    return (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
            <button onClick={() => navigate("/stories")} style={{ marginBottom: "1.5rem" }}>
                ← Back to stories
            </button>

            <h1 style={{ marginBottom: 4 }}>{story?.title}</h1>
            <p style={{ color: "#888", marginBottom: "0.5rem" }}>{story?.genre}</p>
            {story?.description && <p style={{ marginBottom: "2rem" }}>{story.description}</p>}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ fontWeight: 400, margin: 0 }}>Chapters</h2>
                {isLeadAuthor && isOwner && (
                    <button onClick={() => setShowChapterForm(!showChapterForm)}>
                        {showChapterForm ? "Cancel" : "+ Add chapter"}
                    </button>
                )}
            </div>

            {showChapterForm && (
                <form onSubmit={handleCreateChapter} style={{ border: "1px solid #eee", borderRadius: 8, padding: "1.25rem", marginBottom: "1.5rem" }}>
                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: 4, fontSize: 14 }}>Title</label>
                        <input
                            value={newChapter.title}
                            onChange={e => setNewChapter({ ...newChapter, title: e.target.value })}
                            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: 4, fontSize: 14 }}>Body</label>
                        <textarea
                            value={newChapter.body}
                            onChange={e => setNewChapter({ ...newChapter, body: e.target.value })}
                            style={{ width: "100%", padding: "8px", boxSizing: "border-box", minHeight: 120 }}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: 4, fontSize: 14 }}>Order</label>
                        <input
                            type="number"
                            value={newChapter.order}
                            onChange={e => setNewChapter({ ...newChapter, order: parseInt(e.target.value) })}
                            style={{ width: 80, padding: "8px" }}
                            required
                        />
                    </div>
                    <button type="submit">Add chapter</button>
                </form>
            )}

            {chapters.length === 0 && <p>No chapters yet.</p>}
            {chapters
                .sort((a, b) => a.order - b.order)
                .map(chapter => (
                    <div key={chapter.id} style={{
                        border: "1px solid #eee",
                        borderRadius: 8,
                        padding: "1rem 1.25rem",
                        marginBottom: "1rem",
                        cursor: currentUser?.role === "contributor" ? "pointer" : "default"
                    }}
                    onClick={() => {
                        if (currentUser?.role === "contributor") {
                            navigate(`/chapters/${chapter.id}/branch`, { state: { chapter, storyId } })
                        }
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h3 style={{ margin: 0 }}>Chapter {chapter.order}: {chapter.title}</h3>
                            {currentUser?.role === "contributor" && (
                                <span style={{ fontSize: 12, color: "#888" }}>Click to write a branch →</span>
                            )}
                        </div>
                        <p style={{ margin: 0, marginTop: 8, fontSize: 14, color: "#555", whiteSpace: "pre-wrap" }}>
                            {chapter.body.length > 200 ? chapter.body.slice(0, 200) + "..." : chapter.body}
                        </p>
                    </div>
                ))}
        </div>
    )
}

export default StoryDetail