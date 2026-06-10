import prisma from "../lib/prisma.js"

/**
 * List all categories (top level of the content tree).
 */
export async function listCategories() {
    return prisma.category.findMany({
        orderBy: { name: "asc" },
        include: {
            _count: { select: { subjects: true } }
        }
    })
}

/**
 * List subjects under a category, identified by slug.
 */
export async function listSubjectsByCategorySlug(categorySlug) {
    const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
        include: {
            subjects: {
                orderBy: { name: "asc" },
                include: {
                    _count: { select: { topics: true } }
                }
            }
        }
    })

    if (!category) {
        return null
    }

    return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        subjects: category.subjects
    }
}

/**
 * List topics under a subject, identified by category + subject slugs.
 */
export async function listTopicsBySlugs(categorySlug, subjectSlug) {
    const subject = await prisma.subject.findFirst({
        where: {
            slug: subjectSlug,
            category: { slug: categorySlug }
        },
        include: {
            category: true,
            topics: {
                orderBy: { name: "asc" },
                include: {
                    _count: { select: { questions: true } }
                }
            }
        }
    })

    if (!subject) {
        return null
    }

    return {
        id: subject.id,
        name: subject.name,
        slug: subject.slug,
        category: {
            id: subject.category.id,
            name: subject.category.name,
            slug: subject.category.slug
        },
        topics: subject.topics
    }
}

/**
 * Resolve topic by category + subject + topic slugs.
 */
export async function findTopicBySlugs(categorySlug, subjectSlug, topicSlug) {
    return prisma.topic.findFirst({
        where: {
            slug: topicSlug,
            subject: {
                slug: subjectSlug,
                category: { slug: categorySlug }
            }
        },
        include: {
            subject: {
                include: { category: true }
            },
            _count: { select: { questions: true } }
        }
    })
}

/**
 * Paginated practice questions for a topic. Answers are never included.
 */
export async function listPracticeQuestions(topicId, page = 1, limit = 5) {
    const safePage = Math.max(1, page)
    const safeLimit = Math.min(Math.max(1, limit), 20)
    const skip = (safePage - 1) * safeLimit

    const [questions, total] = await Promise.all([
        prisma.question.findMany({
            where: { topicId },
            orderBy: { createdAt: "asc" },
            skip,
            take: safeLimit,
            select: {
                id: true,
                questionText: true,
                options: true,
                difficulty: true
            }
        }),
        prisma.question.count({ where: { topicId } })
    ])

    return {
        questions,
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit) || 1
    }
}

/**
 * Full hierarchy for playground dropdowns (category → subject → topic).
 */
export async function getContentTree() {
    return prisma.category.findMany({
        orderBy: { name: "asc" },
        include: {
            subjects: {
                orderBy: { name: "asc" },
                include: {
                    topics: {
                        orderBy: { name: "asc" },
                        include: {
                            _count: { select: { questions: true } }
                        }
                    }
                }
            }
        }
    })
}
