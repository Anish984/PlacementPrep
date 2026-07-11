import "dotenv/config"
import express from "express"
import http from "http"
import cors from "cors"
import { Server } from "socket.io"

import apiRoutes from "./routes/index.js"
import socketHandler from "./socket/socketHandler.js"

const app = express()

app.use(cors())
app.use(express.json())

app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" })
})

app.use("/api", apiRoutes)

const server = http.createServer(app)

const io = new Server(server, {
    cors: { origin: "*" }
})

socketHandler(io)

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
