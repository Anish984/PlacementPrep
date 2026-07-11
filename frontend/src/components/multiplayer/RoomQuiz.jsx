import RoomLeaderBoard from "./RoomLeaderBoard"

export default function RoomQuiz({
    question,
    roomCode,
    selected,
    submitAnswer,
    reveal,
    yourResult,
    timeLeft,
    leaderboard,
    animatedTop
}) {
    return (
        <div className="space-y-6">
            {/* Header */}

            <div className="rounded-2xl bg-green-800 text-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="text-green-100 text-sm">
                            Room {roomCode}
                        </div>

                        <h1 className="text-2xl font-bold mt-1">
                            Question {question.index} of {question.total}
                        </h1>
                    </div>

                    <div className="text-center">
                        <div className="text-sm text-green-100">
                            Time Left
                        </div>

                        <div className="text-3xl font-bold">
                            {timeLeft ?? "--"}s
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Question */}

                <div className="lg:col-span-2">
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                        <h2 className="text-xl font-semibold leading-relaxed">
                            {question.questionText}
                        </h2>

                        <div className="mt-6 space-y-3">
                            {question.options.map(
                                (option, index) => {
                                    let classes =
                                        "w-full text-left rounded-xl border p-4 transition"

                                    const correct =
                                        reveal &&
                                        index ===
                                            reveal.correctAnswer

                                    const wrong =
                                        selected ===
                                            index &&
                                        yourResult &&
                                        !yourResult.correct

                                    if (correct) {
                                        classes +=
                                            " border-green-500 bg-green-50 dark:bg-green-950/20"
                                    } else if (
                                        wrong
                                    ) {
                                        classes +=
                                            " border-red-500 bg-red-50 dark:bg-red-950/20"
                                    } else {
                                        classes +=
                                            " border-gray-200 dark:border-gray-700 hover:border-green-500"
                                    }

                                    return (
                                        <button
                                            key={index}
                                            disabled={
                                                selected !==
                                                    null ||
                                                timeLeft ===
                                                    0
                                            }
                                            onClick={() =>
                                                submitAnswer(
                                                    index
                                                )
                                            }
                                            className={
                                                classes
                                            }
                                        >
                                            <div className="flex gap-3">
                                                <div className="font-bold text-green-800">
                                                    {String.fromCharCode(
                                                        65 +
                                                            index
                                                    )}
                                                    .
                                                </div>

                                                <div>
                                                    {
                                                        option
                                                    }
                                                </div>
                                            </div>
                                        </button>
                                    )
                                }
                            )}
                        </div>

                        {/* Feedback */}

                        {yourResult && (
                            <div
                                className={`mt-6 rounded-xl p-4 ${
                                    yourResult.correct
                                        ? "bg-green-50 border border-green-300"
                                        : "bg-red-50 border border-red-300"
                                }`}
                            >
                                {yourResult.correct ? (
                                    <div className="text-green-800 font-medium">
                                        ✓ Correct
                                        (+{
                                            yourResult.points
                                        } pts)
                                    </div>
                                ) : (
                                    <div className="text-red-700 font-medium">
                                        ✗ Incorrect
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Explanation */}

                        {reveal?.explanation && (
                            <div className="mt-6 rounded-xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20 p-5">
                                <h3 className="font-semibold">
                                    Explanation
                                </h3>

                                <p className="mt-3 text-gray-700 dark:text-gray-300">
                                    {
                                        reveal.explanation
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}

                <div className="space-y-6">
                    {/* Progress */}

                    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                        <h3 className="font-semibold mb-3">
                            Progress
                        </h3>

                        <div className="text-sm text-gray-500 mb-2">
                            Question {question.index} /{" "}
                            {question.total}
                        </div>

                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-600"
                                style={{
                                    width: `${
                                        (question.index /
                                            question.total) *
                                        100
                                    }%`
                                }}
                            />
                        </div>
                    </div>

                    {/* Leaderboard */}

                    <RoomLeaderBoard
                        leaderboard={
                            leaderboard
                        }
                        animatedTop={
                            animatedTop
                        }
                    />
                </div>
            </div>
        </div>
    )
}