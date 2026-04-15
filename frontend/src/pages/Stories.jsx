import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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

    if (loading) return (
        <div className="min-h-screen bg-ink-50 flex items-center justify-center">
            <p className="text-ink-400 text-sm">Loading stories...</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-ink-50">
            <nav className="border-b border-ink-200 bg-white px-6 py-4">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <h1 className="font-heading text-2xl font-semibold text-ink-900">Kinyurite</h1>
                    <div className="flex items-center gap-3">
                        {currentUser && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-ink-500">{currentUser.username}</span>
                                <Badge variant="outline" className="text-xs">
                                    {currentUser.role === "lead_author" ? "Lead Author" : "Contributor"}
                                </Badge>
                            </div>
                        )}
                        {currentUser?.role === "lead_author" && (
                            <Button variant="outline" size="sm" onClick={() => navigate("/review")}>
                                Review dashboard
                            </Button>
                        )}
                        {currentUser?.role === "contributor" && (
                            <Button variant="outline" size="sm" onClick={() => navigate("/my-branches")}>
                                My branches
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={handleLogout}>
                            Sign out
                        </Button>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-10">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="font-heading text-3xl text-ink-900">Stories</h2>
                        <p className="text-ink-400 text-sm mt-1">
                            {stories.length} {stories.length === 1 ? "story" : "stories"} available
                        </p>
                    </div>
                    {currentUser?.role === "lead_author" && (
                        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                            {showCreateForm ? "Cancel" : "+ New story"}
                        </Button>
                    )}
                </div>

                {showCreateForm && (
                    <Card className="mb-8 border-ink-200">
                        <CardHeader>
                            <CardTitle className="font-heading text-lg">New story</CardTitle>
                            <CardDescription>Start a new collaborative narrative.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateStory} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label>Title</Label>
                                    <Input
                                        value={newStory.title}
                                        onChange={e => setNewStory({ ...newStory, title: e.target.value })}
                                        placeholder="The name of your story"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Genre</Label>
                                    <Input
                                        value={newStory.genre}
                                        onChange={e => setNewStory({ ...newStory, genre: e.target.value })}
                                        placeholder="Sci-fi, Fantasy, Literary Fiction..."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Description</Label>
                                    <textarea
                                        value={newStory.description}
                                        onChange={e => setNewStory({ ...newStory, description: e.target.value })}
                                        placeholder="A short description of your story..."
                                        className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                                <Button type="submit">Create story</Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {stories.length === 0 && (
                    <div className="text-center py-20">
                        <p className="font-heading text-xl text-ink-400">No stories yet.</p>
                        <p className="text-ink-300 text-sm mt-2">Be the first to start one.</p>
                    </div>
                )}

                <div className="space-y-4">
                    {stories.map(story => (
                        <Card
                            key={story.id}
                            onClick={() => navigate(`/stories/${story.id}`)}
                            className="border-ink-200 hover:border-ink-400 hover:shadow-sm transition-all cursor-pointer"
                        >
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="font-heading text-xl text-ink-900 mb-1">{story.title}</h3>
                                        {story.genre && (
                                            <Badge variant="secondary" className="text-xs mb-2">
                                                {story.genre}
                                            </Badge>
                                        )}
                                        {story.description && (
                                            <p className="text-ink-500 text-sm leading-relaxed">
                                                {story.description}
                                            </p>
                                        )}
                                    </div>
                                    <span className="text-ink-300 text-sm ml-4">→</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    )
}

export default Stories