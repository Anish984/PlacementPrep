import { Router } from "express"
import { registerUser, loginUser } from "../services/authService.js"
import { authMiddleware, signToken } from "../middleware/auth.js"

const router = Router()

// router.post("/register", async (req, res) => {
//     try {
//         const { username, email, password } = req.body

//         if (!username || !email || !password) {
//             return res.status(400).json({ error: "All fields are required" })
//         }

//         if (password.length < 6) {
//             return res
//                 .status(400)
//                 .json({ error: "Password must be at least 6 characters" })
//         }

//         const user = await registerUser({ username, email, password })
//         const token = signToken(user.id)

//         res.status(201).json({ user, token })
//     } catch (err) {
//         res.status(400).json({ error: err.message })
//     }
// })

router.post("/register", async (req, res) => {
    try {
        console.log(req.body);

        const { username, email, password } = req.body;

        const user = await registerUser({ username, email, password });

        res.status(201).json(user);
    } catch (err) {
        console.error(err);
        console.error(err.stack);

        res.status(400).json({
            error: err.message
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password required" })
        }

        const user = await loginUser({ email, password })
        const token = signToken(user.id)

        res.json({ user, token })
    } catch (err) {
        res.status(401).json({ error: err.message })
    }
})

router.get("/me", authMiddleware, (req, res) => {
    res.json({ user: req.user })
})

export default router
