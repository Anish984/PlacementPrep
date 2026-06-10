import prisma from "../lib/prisma.js"

/**
 * Check a practice answer. Nothing is saved to the database.
 */
export async function checkPracticeAnswer(questionId, selectedAnswer) {
    const question = await prisma.question.findUnique({
        where: { id: questionId }
    })

    if (!question) {
        throw new Error("Question not found")
    }

    const isCorrect = selectedAnswer === question.correctAnswer

    return {
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation
    }
}
