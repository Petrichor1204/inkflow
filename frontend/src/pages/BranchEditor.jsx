import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import client from "../api/client"

function BranchEditor() {
    const { chapterId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const { chapter, storyId } = location.state || {}
    const [body, setBody] = useState("")
    const [existingBranch, setExistingBranch] = useState(null)
    const [currentUser, setCurrentUser] = useState(null)
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            client.get("/auth/me"),
            client.get(`/chapters/${chapterId}/branches/`)
        ]).then(([userRes, branchesRes]) => {
            setCurrentUser(userRes.data)
            const myBranch = branchesRes.data.find(
                b => b.contributor_id === userRes.data.id
            )
            if (myBranch) {
                setExistingBranch(myBranch)
                setBody(myBranch.body)
            }
            setLoading(false)
        }).catch(() => {
            setLoading(false)
        })
    }, [chapterId])

    async function handleSaveDraft() {
        setSaving(true)
        try {
            if (existingBranch) {
                alert("Branch already submitted — cannot edit further")
                return
            }
            const res = await client.post(`/chapters/${chapterId}/branches/`, { body })
            setExistingBranch(res.data)
            alert("Draft saved successfully")
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to save draft")
        } finally {
            setSaving(false)
        }
    }

    async function handleSubmit() {
        if (!existingBranch) {
            alert("Save your draft first before submitting")
            return
        }
        setSaving(true)
        try {
            const res = await client.patch(
                `/chapters/${chapterId}/branches/${existingBranch.id}/status`,
                { status: "submitted" }
            )
            setExistingBranch(res.data)
            alert("Branch submitted for review")
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to submit branch")
        } finally {
            setSaving(false)
        }
    }

    if (!chapter) {
        navigate("/stories")
        return null
    }

    if (loading) return <p style={{ padding: "2rem" }}>Loading...</p>

    const isSubmitted = existingBranch?.status !== "draft" && existingBranch !== null

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem" }}>
            <button onClick={() => navigate(`/stories/${storyId}`)} style={{ marginBottom: "1.5rem" }}>
                ← Back to story
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <h2 style={{ margin: 0 }}>Branch: {chapter.title}</h2>
                {existingBranch && (
                    <span style={{
                        fontSize: 13,
                        padding: "4px 12px",
                        borderRadius: 20,
                        background: existingBranch.status === "merged" ? "#e6f4ea" :
                                    existingBranch.status === "rejected" ? "#fce8e6" :
                                    existingBranch.status === "draft" ? "#f1f3f4" : "#e8f0fe",
                        color: existingBranch.status === "merged" ? "#137333" :
                               existingBranch.status === "rejected" ? "#c5221f" :
                               existingBranch.status === "draft" ? "#444" : "#1a73e8"
                    }}>
                        {existingBranch.status}
                    </span>
                )}
            </div>

            {existingBranch?.feedback && (
                <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 8, padding: "1rem", marginBottom: "1.5rem" }}>
                    <p style={{ margin: 0, fontSize: 14 }}>
                        <strong>Feedback:</strong> {existingBranch.feedback}
                    </p>
                </div>
            )}

            <p style={{ color: "#888", fontSize: 14, marginBottom: "2rem" }}>
                Read the original on the left, write your version on the right.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                <div>
                    <h3 style={{ fontWeight: 500, marginBottom: "1rem" }}>Original chapter</h3>
                    <div style={{
                        border: "1px solid #eee",
                        borderRadius: 8,
                        padding: "1.25rem",
                        fontSize: 15,
                        lineHeight: 1.7,
                        color: "#444",
                        whiteSpace: "pre-wrap",
                        minHeight: 400
                    }}>
                        {chapter.body}
                    </div>
                </div>

                <div>
                    <h3 style={{ fontWeight: 500, marginBottom: "1rem" }}>Your branch</h3>
                    <textarea
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        disabled={isSubmitted}
                        placeholder="Write your version of this chapter here..."
                        style={{
                            width: "100%",
                            minHeight: 400,
                            padding: "1.25rem",
                            fontSize: 15,
                            lineHeight: 1.7,
                            border: "1px solid #eee",
                            borderRadius: 8,
                            boxSizing: "border-box",
                            resize: "vertical",
                            fontFamily: "inherit",
                            background: isSubmitted ? "#fafafa" : "white",
                            color: isSubmitted ? "#888" : "inherit"
                        }}
                    />
                    <div style={{ marginTop: "1rem", display: "flex", gap: 12 }}>
                        {!existingBranch && (
                            <button
                                onClick={handleSaveDraft}
                                disabled={!body.trim() || saving}
                            >
                                {saving ? "Saving..." : "Save draft"}
                            </button>
                        )}
                        {existingBranch?.status === "draft" && (
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                style={{ background: "#1a73e8", color: "white", border: "none", padding: "8px 16px", borderRadius: 4, cursor: "pointer" }}
                            >
                                {saving ? "Submitting..." : "Submit for review"}
                            </button>
                        )}
                        {isSubmitted && existingBranch?.status !== "merged" && existingBranch?.status !== "rejected" && (
                            <p style={{ margin: 0, fontSize: 14, color: "#888", paddingTop: 8 }}>
                                Submitted — awaiting review
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BranchEditor