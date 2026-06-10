import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { CONTENT_TREE, generateQuestionsForTopic } from "./seedData.js"

const prisma = new PrismaClient()

const QUESTIONS_PER_TOPIC = 20

async function clearDatabase() {
    await prisma.quizAttempt.deleteMany()
    await prisma.quizSession.deleteMany()
    await prisma.question.deleteMany()
    await prisma.topic.deleteMany()
    await prisma.subject.deleteMany()
    await prisma.category.deleteMany()
}

async function seedContent() {
    let totalQuestions = 0

    for (const categoryData of CONTENT_TREE) {
        const category = await prisma.category.create({
            data: {
                name: categoryData.name,
                slug: categoryData.slug
            }
        })

        console.log(`Category: ${category.name}`)

        for (const subjectData of categoryData.subjects) {
            const subject = await prisma.subject.create({
                data: {
                    name: subjectData.name,
                    slug: subjectData.slug,
                    categoryId: category.id
                }
            })

            console.log(`  Subject: ${subject.name}`)

            for (const topicData of subjectData.topics) {
                const topic = await prisma.topic.create({
                    data: {
                        name: topicData.name,
                        slug: topicData.slug,
                        subjectId: subject.id
                    }
                })

                const questions = generateQuestionsForTopic(
                    topicData.slug,
                    QUESTIONS_PER_TOPIC
                )

                await prisma.question.createMany({
                    data: questions.map((question) => ({
                        topicId: topic.id,
                        questionText: question.questionText,
                        options: question.options,
                        correctAnswer: question.correctAnswer,
                        explanation: question.explanation,
                        difficulty: question.difficulty
                    }))
                })

                totalQuestions += questions.length
                console.log(`    Topic: ${topic.name} (${questions.length} questions)`)
            }
        }
    }

    return totalQuestions
}

async function main() {
    console.log("Seeding LetsQuiz database...\n")

    await clearDatabase()
    const totalQuestions = await seedContent()

    console.log(`\nDone. Seeded ${totalQuestions} questions.`)
}

main()
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
