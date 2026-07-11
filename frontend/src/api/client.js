const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

function getToken() {
    return localStorage.getItem("token")
}

async function request(path, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...options.headers
    }

    const token = getToken()
    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error || "Request failed")
    }

    return data
}

export const api = {
    // Auth
    register: (body) =>
        request("/auth/register", { method: "POST", body: JSON.stringify(body) }),

    login: (body) =>
        request("/auth/login", { method: "POST", body: JSON.stringify(body) }),

    getMe: () => request("/auth/me"),

    // Content browsing (Category → Subject → Topic → Questions)
    getCategories: () => request("/content/categories"),

    getSubjects: (categorySlug) =>
        request(`/content/categories/${categorySlug}/subjects`),

    getTopics: (categorySlug, subjectSlug) =>
        request(`/content/categories/${categorySlug}/subjects/${subjectSlug}/topics`),

    getPracticeQuestions: (categorySlug, subjectSlug, topicSlug, page = 1, limit = 5) =>
        request(
            `/content/categories/${categorySlug}/subjects/${subjectSlug}/topics/${topicSlug}/questions?page=${page}&limit=${limit}`
        ),

    getContentTree: () => request("/content/tree"),

    // Practice (no save)
    checkPracticeAnswer: (questionId, selectedAnswer) =>
        request("/practice/check", {
            method: "POST",
            body: JSON.stringify({ questionId, selectedAnswer })
        }),

    // Playground quiz (saved sessions)
    // Accepts an object: { categoryId?, subjectId?, topicId?, count }
    startQuiz: (opts) =>
        request("/quiz/start", {
            method: "POST",
            body: JSON.stringify(opts)
        }),

    submitQuizAnswer: (body) =>
        request("/quiz/submit", { method: "POST", body: JSON.stringify(body) }),

    completeQuiz: (sessionId) =>
        request("/quiz/complete", {
            method: "POST",
            body: JSON.stringify({ sessionId })
        }),

    getQuizHistory: (page = 1) => request(`/quiz/history?page=${page}`),
    getMultiplayerHistory: (page = 1) => request(`/quiz/multiplayer/history?page=${page}`),

    getDashboard: () => request("/analytics/dashboard"),

    getWeakTopics: () => request("/analytics/weak-topics")
}
