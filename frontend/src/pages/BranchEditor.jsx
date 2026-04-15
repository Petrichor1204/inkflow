import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import client from "../api/client"

const STATUS_STYLES = {
    draft: "bg-ink-100 text-ink-600",
    submitted: "bg-blue-50 text-blue-700",
    under_review: "bg-amber-50 text-amber-700",
    merged: "bg-green-50 text-green-700",
    rejected: "bg-red-50 text-red-700"
}

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
        }).catch(() => setLoading(false))
    }, [chapterId])

    async function handleSaveDraft() {
        setSaving(true)
        try {
            const res = await client.post(`/chapters/${chapterId}/branches/`, { body })
            setExistingBranch(res.data)
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

    if (loading) return (
        <div className="min-h-screen bg-ink-50 flex items-center justify-center">
            <p className="text-ink-400 text-sm">Loading editor...</p>
        </div>
    )

    const isSubmitted = existingBranch?.status !== "draft" && existingBranch !== null

    return (
        <div className="min-h-screen bg-ink-50">
            <nav className="border-b border-ink-200 bg-white px-6 py-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="font-heading text-2xl font-semibold text-ink-900">Kinyurite</h1>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/stories/${storyId}`)}>
                        ← Back to story
                    </Button>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="font-heading text-2xl text-ink-900">{chapter.title}</h2>
                    {existingBranch && (
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_STYLES[existingBranch.status]}`}>
                            {existingBranch.status.replace("_", " ")}
                        </span>
                    )}
                </div>
                <p className="text-ink-400 text-sm mb-6">
                    Read the original on the left, write your version on the right.
                </p>

                {existingBranch?.feedback && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6">
                        <p className="text-sm text-amber-800">
                            <span className="font-medium">Feedback: </span>
                            {existingBranch.feedback}
                        </p>
                    </div>
                )}

                <Separator className="mb-6" />

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-xs font-medium text-ink-400 uppercase tracking-wide mb-3">
                            Original chapter
                        </p>
                        <div className="bg-white border border-ink-200 rounded-lg p-5 min-h-[500px] text-sm text-ink-700 leading-relaxed whitespace-pre-wrap font-body">
                            {chapter.body}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-medium text-ink-400 uppercase tracking-wide mb-3">
                            Your branch
                        </p>
                        <textarea
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            disabled={isSubmitted}
                            placeholder="Write your version of this chapter here..."
                            className={`w-full min-h-[500px] p-5 rounded-lg border text-sm leading-relaxed font-body resize-none focus:outline-none focus:ring-2 focus:ring-ink-300 ${
                                isSubmitted
                                    ? "bg-ink-50 border-ink-200 text-ink-400 cursor-not-allowed"
                                    : "bg-white border-ink-200 text-ink-800"
                            }`}
                        />

                        <div className="flex items-center gap-3 mt-4">
                            {!existingBranch && (
                                <Button
                                    onClick={handleSaveDraft}
                                    disabled={!body.trim() || saving}
                                    variant="outline"
                                >
                                    {saving ? "Saving..." : "Save draft"}
                                </Button>
                            )}
                            {existingBranch?.status === "draft" && (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={saving}
                                >
                                    {saving ? "Submitting..." : "Submit for review"}
                                </Button>
                            )}
                            {isSubmitted && existingBranch?.status !== "merged" && existingBranch?.status !== "rejected" && (
                                <p className="text-sm text-ink-400">
                                    Submitted — awaiting review
                                </p>
                            )}
                            {existingBranch?.status === "merged" && (
                                <p className="text-sm text-green-600 font-medium">
                                    ✓ This branch was merged into the story
                                </p>
                            )}
                            {existingBranch?.status === "rejected" && (
                                <p className="text-sm text-red-600">
                                    This branch was not accepted
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default BranchEditor