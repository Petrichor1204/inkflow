import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import client from "../api/client"

const STATUS_STYLES = {
    draft: { background: "#f1f3f4", color: "#444" },
    submitted: { background: "#e8f0fe", color: "#1a73e8" },
    under_review: { background: "#fff8e1", color: "#f9a825" },
    merged: { background: "#e6f4ea", color: "#137333" },
    rejected: { background: "#fce8e6", color: "#c5221f" }
}

function ContributorDashboard() {
    const [branches, setBranches] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState("all")
    const navigate = useNavigate()

    useEffect(() => {
        client.get("/review/my-branches")
            .then(res => {
                setBranches(res.data)
                setLoading(false)
            })
            .catch(() => {
                navigate("/stories")
            })
    }, [])

    const filtered = filter === "all"
        ? branches
        : branches.filter(b => b.branch_status === filter)

    if (loading) return <p style={{ padding: "2rem" }}>Loading...</p>

    return (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1>My branches</h1>
                <button onClick={() => navigate("/stories")}>← Back to stories</button>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem", flexWrap: "wrap" }}>
                {["all", "draft", "submitted", "under_review", "merged", "rejected"].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        style={{
                            padding: "5px 14px",
                            borderRadius: 20,
                            border: filter === s ? "1.5px solid #1a73e8" : "1px solid #eee",
                            background: filter === s ? "#e8f0fe" : "white",
                            color: filter === s ? "#1a73e8" : "#444",
                            cursor: "pointer",
                            fontSize: 13
                        }}
                    >
                        {s === "all" ? "All" : s.replace("_", " ")}
                    </button>
                ))}
            </div>

            {filtered.length === 0 && (
                <p style={{ color: "#888" }}>
                    {filter === "all" ? "You haven't submitted any branches yet." : `No branches with status "${filter}".`}
                </p>
            )}

            {filtered.map(branch => (
                <div
                    key={branch.branch_id}
                    style={{
                        border: "1px solid #eee",
                        borderRadius: 8,
                        padding: "1rem 1.25rem",
                        marginBottom: "1rem"
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div>
                            <strong style={{ fontSize: 15 }}>{branch.chapter_title}</strong>
                            <span style={{ fontSize: 13, color: "#888", marginLeft: 8 }}>{branch.story_title}</span>
                        </div>
                        <span style={{
                            fontSize: 12,
                            padding: "3px 12px",
                            borderRadius: 20,
                            ...STATUS_STYLES[branch.branch_status]
                        }}>
                            {branch.branch_status.replace("_", " ")}
                        </span>
                    </div>

                    <p style={{ margin: 0, fontSize: 14, color: "#555", marginBottom: 8 }}>
                        {branch.branch_body.length > 150
                            ? branch.branch_body.slice(0, 150) + "..."
                            : branch.branch_body}
                    </p>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "#aaa" }}>
                            Updated {new Date(branch.branch_updated_at).toLocaleDateString()}
                        </span>
                        {branch.branch_status === "draft" && (
                            <button
                                onClick={() => navigate(`/chapters/${branch.chapter_id}/branch`, {
                                    state: {
                                        chapter: {
                                            id: branch.chapter_id,
                                            title: branch.chapter_title,
                                            body: branch.chapter_body
                                        },
                                        storyId: branch.story_id
                                    }
                                })}
                                style={{ fontSize: 13 }}
                            >
                                Continue editing →
                            </button>
                        )}
                    </div>

                    {branch.feedback && (
                        <div style={{
                            marginTop: 10,
                            background: "#fff8e1",
                            border: "1px solid #ffe082",
                            borderRadius: 6,
                            padding: "0.75rem 1rem",
                            fontSize: 14
                        }}>
                            <strong>Feedback:</strong> {branch.feedback}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default ContributorDashboard