import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Stories from "./pages/Stories"
import StoryDetail from "./pages/StoryDetail"
import BranchEditor from "./pages/BranchEditor"
import ReviewDashboard from "./pages/ReviewDashboard"
import ContributorDashboard from "./pages/ContributorDashboard"

function ProtectedRoute({ children }) {
    const token = localStorage.getItem("token")
    if (!token) return <Navigate to="/login" />
    return children
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/stories" element={
                    <ProtectedRoute>
                        <Stories />
                    </ProtectedRoute>
                } />
                <Route path="/stories/:storyId" element={
                    <ProtectedRoute>
                        <StoryDetail />
                    </ProtectedRoute>
                } />
                <Route path="/chapters/:chapterId/branch" element={
                    <ProtectedRoute>
                        <BranchEditor />
                    </ProtectedRoute>
                } />
                <Route path="/review" element={
                    <ProtectedRoute>
                        <ReviewDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/" element={<Navigate to="/stories" />} />
                <Route path="/my-branches" element={
                    <ProtectedRoute>
                        <ContributorDashboard />
                    </ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    )
}

export default App