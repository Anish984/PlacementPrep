export default function RoomPlayers({
    players,
    hostPlayerId
}) {
    return (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-xl font-semibold mb-4">
                Players ({players.length}/8)
            </h2>

            <div className="space-y-3">
                {players.map((player) => (
                    <div
                        key={player.playerId}
                        className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-xl p-3"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-green-800 text-white flex items-center justify-center font-bold">
                                {player.username
                                    ?.charAt(0)
                                    ?.toUpperCase()}
                            </div>

                            <div>
                                <div className="font-medium">
                                    {
                                        player.username
                                    }
                                </div>

                                {player.playerId ===
                                    hostPlayerId && (
                                    <div className="text-xs text-green-800">
                                        Host
                                    </div>
                                )}
                            </div>
                        </div>

                        <div
                            className={`text-sm ${
                                player.connected
                                    ? "text-green-600"
                                    : "text-gray-500"
                            }`}
                        >
                            {player.connected
                                ? "Online"
                                : "Offline"}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}