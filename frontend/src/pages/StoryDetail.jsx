import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
        }).catch(() => navigate("/stories"))
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

    if (loading) return (
        <div className="min-h-screen bg-ink-50 flex items-center justify-center">
            <p className="text-ink-400 text-sm">Loading story...</p>
        </div>
    )

    const isLeadAuthor = currentUser?.role === "lead_author"
    const isOwner = story?.lead_author_id === currentUser?.id

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

            <main className="max-w-4xl mx-auto px-6 py-10">
                <div className="mb-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="font-heading text-4xl text-ink-900 mb-2">{story?.title}</h2>
                            {story?.genre && (
                                <Badge variant="secondary" className="mb-3">{story.genre}</Badge>
                            )}
                            {story?.description && (
                                <p className="text-ink-500 text-sm leading-relaxed max-w-2xl">
                                    {story.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <Separator className="mb-8" />

                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-heading text-2xl text-ink-800">Chapters</h3>
                    {isLeadAuthor && isOwner && (
                        <Button
                            variant={showChapterForm ? "outline" : "default"}
                            onClick={() => setShowChapterForm(!showChapterForm)}
                        >
                            {showChapterForm ? "Cancel" : "+ Add chapter"}
                        </Button>
                    )}
                </div>

                {showChapterForm && (
                    <Card className="mb-8 border-ink-200">
                        <CardHeader>
                            <CardTitle className="font-heading text-lg">New chapter</CardTitle>
                            <CardDescription>Add a new chapter to your story.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateChapter} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label>Title</Label>
                                    <Input
                                        value={newChapter.title}
                                        onChange={e => setNewChapter({ ...newChapter, title: e.target.value })}
                                        placeholder="Chapter title"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Body</Label>
                                    <textarea
                                        value={newChapter.body}
                                        onChange={e => setNewChapter({ ...newChapter, body: e.target.value })}
                                        placeholder="Write your chapter here..."
                                        className="w-full min-h-[160px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-vertical focus:outline-none focus:ring-2 focus:ring-ring font-body leading-relaxed"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Order</Label>
                                    <Input
                                        type="number"
                                        value={newChapter.order}
                                        onChange={e => setNewChapter({ ...newChapter, order: parseInt(e.target.value) })}
                                        className="w-20"
                                        required
                                    />
                                </div>
                                <Button type="submit">Add chapter</Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {chapters.length === 0 && (
                    <div className="text-center py-16">
                        <p className="font-heading text-xl text-ink-400">No chapters yet.</p>
                        {isLeadAuthor && isOwner && (
                            <p className="text-ink-300 text-sm mt-2">Add the first chapter to get started.</p>
                        )}
                    </div>
                )}

                <div className="space-y-4">
                    {chapters
                        .sort((a, b) => a.order - b.order)
                        .map(chapter => (
                            <Card
                                key={chapter.id}
                                onClick={() => {
                                    if (currentUser?.role === "contributor") {
                                        navigate(`/chapters/${chapter.id}/branch`, {
                                            state: { chapter, storyId }
                                        })
                                    }
                                }}
                                className={`border-ink-200 transition-all ${
                                    currentUser?.role === "contributor"
                                        ? "hover:border-ink-400 hover:shadow-sm cursor-pointer"
                                        : ""
                                }`}
                            >
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs text-ink-400 font-medium uppercase tracking-wide">
                                                    Chapter {chapter.order}
                                                </span>
                                            </div>
                                            <h4 className="font-heading text-lg text-ink-900 mb-2">
                                                {chapter.title}
                                            </h4>
                                            <p className="text-ink-500 text-sm leading-relaxed">
                                                {chapter.body.length > 200
                                                    ? chapter.body.slice(0, 200) + "..."
                                                    : chapter.body}
                                            </p>
                                        </div>
                                        {currentUser?.role === "contributor" && (
                                            <span className="text-ink-300 text-sm ml-4 mt-1">→</span>
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

export default StoryDetail