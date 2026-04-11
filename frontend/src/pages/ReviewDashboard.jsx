import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import client from "../api/client"

function ReviewDashboard() {
    const [branches, setBranches] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)
    const [feedback, setFeedback] = useState("")
    const [saving, setSaving] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        client.get("/review/pending")
            .then(res => {
                setBranches(res.data)
                setLoading(false)
            })
            .catch(() => navigate("/stories"))
    }, [])

    async function handleAction(status) {
        if (!selected) return
        setSaving(true)
        try {
            await client.patch(`/review/${selected.branch_id}`, {
                status,
                feedback: feedback || undefined
            })
            setBranches(branches.filter(b => b.branch_id !== selected.branch_id))
            setSelected(null)
            setFeedback("")
        } catch (err) {
            alert(err.response?.data?.detail || "Action failed")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <p style={{ padding: "2rem" }}>Loading...</p>

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1>Review dashboard</h1>
                <button onClick={() => navigate("/stories")}>← Back to stories</button>
            </div>

            {branches.length === 0 && (
                <p style={{ color: "#888" }}>No branches pending review.</p>
            )}

            <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1.5fr" : "1fr", gap: "2rem" }}>
                <div>
                    {branches.map(branch => (
                        <div
                            key={branch.branch_id}
                            onClick={() => { setSelected(branch); setFeedback("") }}
                            style={{
                                border: `1px solid ${selected?.branch_id === branch.branch_id ? "#1a73e8" : "#eee"}`,
                                borderRadius: 8,
                                padding: "1rem 1.25rem",
                                marginBottom: "1rem",
                                cursor: "pointer",
                                background: selected?.branch_id === branch.branch_id ? "#f8f9ff" : "white"
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                <strong style={{ fontSize: 15 }}>{branch.chapter_title}</strong>
                                <span style={{
                                    fontSize: 12,
                                    padding: "2px 10px",
                                    borderRadius: 20,
                                    background: branch.branch_status === "submitted" ? "#e8f0fe" : "#fff8e1",
                                    color: branch.branch_status === "submitted" ? "#1a73e8" : "#f9a825"
                                }}>
                                    {branch.branch_status}
                                </span>
                            </div>
                            <p style={{ margin: 0, fontSize: 13, color: "#888" }}>
                                {branch.story_title} · updated {new Date(branch.branch_updated_at).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>

                {selected && (
                    <div>
                        <h3 style={{ marginBottom: "0.5rem" }}>{selected.chapter_title}</h3>
                        <p style={{ color: "#888", fontSize: 13, marginBottom: "1.5rem" }}>
                            {selected.story_title}
                        </p>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Original</p>
                                <div style={{
                                    border: "1px solid #eee",
                                    borderRadius: 8,
                                    padding: "1rem",
                                    fontSize: 14,
                                    lineHeight: 1.7,
                                    whiteSpace: "pre-wrap",
                                    minHeight: 200,
                                    color: "#444"
                                }}>
                                    {selected.chapter_body}
                                </div>
                            </div>
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Contributor's version</p>
                                <div style={{
                                    border: "1px solid #eee",
                                    borderRadius: 8,
                                    padding: "1rem",
                                    fontSize: 14,
                                    lineHeight: 1.7,
                                    whiteSpace: "pre-wrap",
                                    minHeight: 200,
                                    color: "#444"
                                }}>
                                    {selected.branch_body}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: "1rem" }}>
                            <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
                                Feedback (optional)
                            </label>
                            <textarea
                                value={feedback}
                                onChange={e => setFeedback(e.target.value)}
                                placeholder="Leave feedback for the contributor..."
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    fontSize: 14,
                                    border: "1px solid #eee",
                                    borderRadius: 8,
                                    boxSizing: "border-box",
                                    minHeight: 80,
                                    fontFamily: "inherit",
                                    resize: "vertical"
                                }}
                            />
                        </div>

                        <div style={{ display: "flex", gap: 12 }}>
                            {selected.branch_status === "submitted" && (
                                <button
                                    onClick={() => handleAction("under_review")}
                                    disabled={saving}
                                    style={{ padding: "8px 16px" }}
                                >
                                    Start review
                                </button>
                            )}
                            {selected.branch_status === "under_review" && (
                                <>
                                    <button
                                        onClick={() => handleAction("merged")}
                                        disabled={saving}
                                        style={{ background: "#137333", color: "white", border: "none", padding: "8px 16px", borderRadius: 4, cursor: "pointer" }}
                                    >
                                        {saving ? "Saving..." : "Merge"}
                                    </button>
                                    <button
                                        onClick={() => handleAction("rejected")}
                                        disabled={saving}
                                        style={{ background: "#c5221f", color: "white", border: "none", padding: "8px 16px", borderRadius: 4, cursor: "pointer" }}
                                    >
                                        {saving ? "Saving..." : "Reject"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ReviewDashboard