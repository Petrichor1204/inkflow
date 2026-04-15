import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import client from "../api/client"

const STATUS_STYLES = {
    draft: "bg-ink-100 text-ink-600 border-ink-200",
    submitted: "bg-blue-50 text-blue-700 border-blue-200",
    under_review: "bg-amber-50 text-amber-700 border-amber-200",
    merged: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200"
}

const FILTERS = ["all", "draft", "submitted", "under_review", "merged", "rejected"]

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
            .catch(() => navigate("/stories"))
    }, [])

    const filtered = filter === "all"
        ? branches
        : branches.filter(b => b.branch_status === filter)

    if (loading) return (
        <div className="min-h-screen bg-ink-50 flex items-center justify-center">
            <p className="text-ink-400 text-sm">Loading your branches...</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-ink-50">
            <nav className="border-b border-ink-200 bg-white px-6 py-4">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <h1 className="font-heading text-2xl font-semibold text-ink-900">Kinyurite</h1>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/stories")}>
                        ← Back to stories
                    </Button>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h2 className="font-heading text-3xl text-ink-900 mb-1">My branches</h2>
                    <p className="text-ink-400 text-sm">
                        {branches.length} {branches.length === 1 ? "branch" : "branches"} total
                    </p>
                </div>

                <div className="flex gap-2 flex-wrap mb-6">
                    {FILTERS.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                                filter === f
                                    ? "bg-ink-900 text-white border-ink-900"
                                    : "bg-white text-ink-500 border-ink-200 hover:border-ink-400"
                            }`}
                        >
                            {f === "all" ? "All" : f.replace("_", " ")}
                        </button>
                    ))}
                </div>

                <Separator className="mb-6" />

                {filtered.length === 0 && (
                    <div className="text-center py-20">
                        <p className="font-heading text-xl text-ink-400">
                            {filter === "all" ? "No branches yet." : `No ${filter.replace("_", " ")} branches.`}
                        </p>
                        {filter === "all" && (
                            <p className="text-ink-300 text-sm mt-2">
                                Find a story and start contributing.
                            </p>
                        )}
                    </div>
                )}

                <div className="space-y-3">
                    {filtered.map(branch => (
                        <Card key={branch.branch_id} className="border-ink-200 bg-ink-50">
                            <CardContent className="pt-4 pb-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-heading text-base text-ink-900">
                                            {branch.chapter_title}
                                        </p>
                                        <p className="text-xs text-ink-400 mt-0.5">
                                            {branch.story_title}
                                        </p>
                                    </div>
                                    <span className={`text-xs px-2.5 py-0.5 rounded-full border ${STATUS_STYLES[branch.branch_status]}`}>
                                        {branch.branch_status.replace("_", " ")}
                                    </span>
                                </div>

                                <p className="text-sm text-ink-500 leading-relaxed mb-2">
                                    {branch.branch_body.length > 150
                                        ? branch.branch_body.slice(0, 150) + "..."
                                        : branch.branch_body}
                                </p>

                                {branch.feedback && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-2">
                                        <p className="text-xs text-amber-800">
                                            <span className="font-medium">Feedback: </span>
                                            {branch.feedback}
                                        </p>
                                    </div>
                                )}

                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-ink-300">
                                        Updated {new Date(branch.branch_updated_at).toLocaleDateString()}
                                    </span>
                                    {branch.branch_status === "draft" && (
                                        <Button
                                            size="sm"
                                            variant="outline"
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
                                        >
                                            Continue editing →
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    )
}

export default ContributorDashboard