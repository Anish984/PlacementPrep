import bcrypt from "bcryptjs"
import prisma from "../lib/prisma.js"

export async function registerUser({ username, email, password }) {
    const existing = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] }
    })

    if (existing) {
        throw new Error(
            existing.email === email
                ? "Email already registered"
                : "Username already taken"
        )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    return prisma.user.create({
        data: { username, email, passwordHash },
        select: { id: true, username: true, email: true, createdAt: true }
    })
}

export async function loginUser({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
        throw new Error("Invalid email or password")
    }

    const valid = await bcrypt.compare(password, user.passwordHash)

    if (!valid) {
        throw new Error("Invalid email or password")
    }

    return {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
    }
}
