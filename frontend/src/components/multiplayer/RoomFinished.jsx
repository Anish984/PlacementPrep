import { Link } from "react-router-dom"
import RoomLeaderboard from "./RoomLeaderBoard"
export default function RoomFinished({
    personalFinished
}) {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl bg-green-800 text-white p-8 text-center">
                <div className="text-6xl mb-4">
                    🎉
                </div>

                <h1 className="text-4xl font-bold">
                    Finished
                </h1>

                <p className="mt-3 text-green-100">
                    Your Score:{" "}
                    {
                        personalFinished.yourScore
                    }
                </p>
            </div>

            <div className="mt-8">
                <RoomLeaderboard
                    leaderboard={
                        personalFinished.leaderboard
                    }
                />
            </div>

            <div className="flex justify-center gap-3 mt-8">
                <Link to="/multiplayer">
                    <button className="bg-green-800 text-white px-6 py-3 rounded-xl">
                        New Room
                    </button>
                </Link>

                <Link to="/">
                    <button className="border border-gray-300 dark:border-gray-700 px-6 py-3 rounded-xl">
                        Home
                    </button>
                </Link>
            </div>
        </div>
    )
}