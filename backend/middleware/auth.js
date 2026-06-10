import jwt from "jsonwebtoken"
import prisma from "../lib/prisma.js"

const JWT_SECRET = process.env.JWT_SECRET || "letsquiz-dev-secret"

export function signToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
}

export async function authMiddleware(req, res, next) {
    const header = req.headers.authorization

    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authentication required" })
    }

    try {
        const token = header.slice(7)
        const { userId } = jwt.verify(token, JWT_SECRET)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, username: true, email: true, createdAt: true }
        })

        if (!user) {
            return res.status(401).json({ error: "User not found" })
        }

        req.user = user
        next()
    } catch {
        return res.status(401).json({ error: "Invalid or expired token" })
    }
}
