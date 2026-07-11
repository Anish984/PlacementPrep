export default function RoomLeaderboard({
    leaderboard,
    animatedTop = []
}) {
    return (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-xl font-semibold mb-4">
                Leaderboard
            </h2>

            <div className="space-y-3">
                {leaderboard.map((player, index) => {
                    const id =
                        player.playerId ||
                        player.socketId

                    const animated =
                        animatedTop.includes(id)

                    return (
                        <div
                            key={id}
                            className={`flex items-center justify-between rounded-xl border p-3 ${
                                animated
                                    ? "border-yellow-400 ring-2 ring-yellow-300"
                                    : "border-gray-200 dark:border-gray-700"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-green-800 text-white flex items-center justify-center font-bold">
                                    {index + 1}
                                </div>

                                <div>
                                    <div className="font-medium">
                                        {
                                            player.username
                                        }
                                    </div>
                                </div>
                            </div>

                            <div className="font-semibold text-green-800">
                                {player.score}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}