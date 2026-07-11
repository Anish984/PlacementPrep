import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"

import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import CategoryList from "./pages/CategoryList"
import SubjectList from "./pages/SubjectList"
import TopicList from "./pages/TopicList"
import Practice from "./pages/Practice"
import Playground from "./pages/Playground"
import Quiz from "./pages/Quiz"
import Result from "./pages/Result"
import QuizHistory from "./pages/QuizHistory"
import Dashboard from "./pages/Dashboard"
import Multiplayer from "./pages/Multiplayer"
import Room from "./pages/Room"

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/subjects" element={<CategoryList />} />
                    <Route path="/subjects/:categorySlug" element={<SubjectList />} />
                    <Route
                        path="/subjects/:categorySlug/:subjectSlug"
                        element={<TopicList />}
                    />
                    <Route
                        path="/subjects/:categorySlug/:subjectSlug/:topicSlug"
                        element={<Practice />}
                    />

                    <Route path="/multiplayer" element={<Multiplayer />} />
                    <Route path="/room/:roomCode" element={<Room />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/playground" element={<Playground />} />
                    <Route path="/quiz" element={<Quiz />} />
                    <Route path="/results" element={<Result />} />
                    <Route path="/history" element={<QuizHistory />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App
