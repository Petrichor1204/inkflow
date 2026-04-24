import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import DiffViewer from "../components/DiffViewer"
import client from "../api/client"

const STATUS_STYLES = {
    submitted: "bg-sky-50 text-sky-700 border-sky-200",
    under_review: "bg-amber-50 text-amber-700 border-amber-200",
}

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

    if (loading) return (
        <div className="min-h-screen bg-ink-50 flex items-center justify-center">
            <p className="text-ink-400 text-sm">Loading reviews...</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-ink-50">
            <nav className="border-b border-ink-200 bg-white px-6 py-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="font-heading text-2xl font-semibold text-ink-900">Kinyurite</h1>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/stories")}>
                        ← Back to stories
                    </Button>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-10">
                <div className="mb-8 pt-4">
                    <h2 className="font-heading text-3xl text-ink-900 mb-1">Review dashboard</h2>
                    <p className="text-ink-400 text-sm">
                        {branches.length} {branches.length === 1 ? "branch" : "branches"} awaiting review
                    </p>
                </div>

                {branches.length === 0 && (
                    <div className="text-center py-20">
                        <p className="font-heading text-xl text-ink-400">All caught up.</p>
                        <p className="text-ink-300 text-sm mt-2">No branches pending review.</p>
                    </div>
                )}

                <div className={`grid gap-6 ${selected ? "grid-cols-[320px_1fr]" : "grid-cols-1 max-w-xl"}`}>
                    <div className="space-y-3">
                        {branches.map(branch => (
                            <Card
                                key={branch.branch_id}
                                onClick={() => { setSelected(branch); setFeedback("") }}
                                className={`cursor-pointer transition-all ${
                                    selected?.branch_id === branch.branch_id
                                        ? "border-ink-400 shadow-sm"
                                        : "border-ink-200 hover:border-ink-300"
                                }`}
                            >
                                <CardContent className="pt-4 pb-4">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="font-medium text-ink-900 text-sm">{branch.chapter_title}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[branch.branch_status]}`}>
                                            {branch.branch_status.replace("_", " ")}
                                        </span>
                                    </div>
                                    <p className="text-xs text-ink-400">
                                        {branch.story_title} · {new Date(branch.branch_updated_at).toLocaleDateString()}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {selected && (
                        <div>
                            <Card className="border-ink-200">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="font-heading text-xl">{selected.chapter_title}</CardTitle>
                                            <CardDescription>{selected.story_title}</CardDescription>
                                        </div>
                                        <span className={`text-xs px-3 py-1 rounded-full border ${STATUS_STYLES[selected.branch_status]}`}>
                                            {selected.branch_status.replace("_", " ")}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-3 mb-4">
                                        <span className="flex items-center gap-1.5 text-xs text-ink-400">
                                            <span className="w-3 h-3 rounded-sm bg-green-100 border border-green-300 inline-block"></span>
                                            added
                                        </span>
                                        <span className="flex items-center gap-1.5 text-xs text-ink-400">
                                            <span className="w-3 h-3 rounded-sm bg-red-100 border border-red-300 inline-block"></span>
                                            removed
                                        </span>
                                    </div>

                                    <DiffViewer
                                        original={selected.chapter_body}
                                        modified={selected.branch_body}
                                    />

                                    <Separator className="my-6" />

                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-ink-700">
                                            Feedback <span className="text-ink-400 font-normal">(optional)</span>
                                        </label>
                                        <textarea
                                            value={feedback}
                                            onChange={e => setFeedback(e.target.value)}
                                            placeholder="Leave a note for the contributor..."
                                            className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring font-body"
                                        />
                                    </div>

                                    <div className="flex gap-3 mt-4">
                                        {selected.branch_status === "submitted" && (
                                            <Button
                                                variant="outline"
                                                onClick={() => handleAction("under_review")}
                                                disabled={saving}
                                            >
                                                Start review
                                            </Button>
                                        )}
                                        {selected.branch_status === "under_review" && (
                                            <>
                                                <Button
                                                    onClick={() => handleAction("merged")}
                                                    disabled={saving}
                                                    className="bg-green-700 hover:bg-green-800 text-white"
                                                >
                                                    {saving ? "Saving..." : "Merge"}
                                                </Button>
                                                <Button
                                                    onClick={() => handleAction("rejected")}
                                                    disabled={saving}
                                                    variant="destructive"
                                                >
                                                    {saving ? "Saving..." : "Reject"}
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default ReviewDashboard