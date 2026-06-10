/**
 * Static content structure for LetsQuiz Phase 1.
 * Category → Subject → Topic
 */
export const CONTENT_TREE = [
    {
        name: "Aptitude",
        slug: "aptitude",
        subjects: [
            {
                name: "Arithmetic",
                slug: "arithmetic",
                topics: [
                    { name: "Addition & Subtraction", slug: "addition-subtraction" },
                    { name: "Multiplication & Division", slug: "multiplication-division" },
                    { name: "Percentages", slug: "percentages" }
                ]
            },
            {
                name: "Reasoning",
                slug: "reasoning",
                topics: [
                    { name: "Number Series", slug: "number-series" },
                    { name: "Logical Patterns", slug: "logical-patterns" }
                ]
            },
            {
                name: "Verbal",
                slug: "verbal",
                topics: [
                    { name: "Synonyms & Antonyms", slug: "synonyms-antonyms" },
                    { name: "Grammar", slug: "grammar" }
                ]
            }
        ]
    },
    {
        name: "Technical",
        slug: "technical",
        subjects: [
            {
                name: "Programming",
                slug: "programming",
                topics: [
                    { name: "JavaScript", slug: "javascript" },
                    { name: "Python", slug: "python" }
                ]
            },
            {
                name: "Computer Science",
                slug: "computer-science",
                topics: [
                    { name: "Data Structures", slug: "data-structures" },
                    { name: "DBMS", slug: "dbms" },
                    { name: "Operating Systems", slug: "operating-systems" }
                ]
            }
        ]
    }
]

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"]

function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)]
}

function shuffleOptions(correctText, wrongTexts) {
    const options = [correctText, ...wrongTexts.slice(0, 3)]
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[options[i], options[j]] = [options[j], options[i]]
    }
    return {
        options,
        correctAnswer: options.indexOf(correctText)
    }
}

/**
 * Generate a batch of questions for a topic slug.
 * Each topic gets the same generator keyed by slug.
 */
export function generateQuestionsForTopic(topicSlug, count = 20) {
    const generator = QUESTION_GENERATORS[topicSlug] || generateGenericQuestions
    return generator(count)
}

const QUESTION_GENERATORS = {
    "addition-subtraction": generateAdditionSubtraction,
    "multiplication-division": generateMultiplicationDivision,
    "percentages": generatePercentages,
    "number-series": generateNumberSeries,
    "logical-patterns": generateLogicalPatterns,
    "synonyms-antonyms": generateSynonyms,
    "grammar": generateGrammar,
    "javascript": generateJavaScript,
    "python": generatePython,
    "data-structures": generateDataStructures,
    "dbms": generateDbms,
    "operating-systems": generateOperatingSystems
}

function generateAdditionSubtraction(count) {
    const questions = []
    for (let i = 0; i < count; i++) {
        if (i % 2 === 0) {
            const a = Math.floor(Math.random() * 50) + 10
            const b = Math.floor(Math.random() * 30) + 5
            const answer = a + b
            const { options, correctAnswer } = shuffleOptions(
                String(answer),
                [String(answer + 3), String(answer - 2), String(answer + 7)]
            )
            questions.push({
                questionText: `What is ${a} + ${b}?`,
                options,
                correctAnswer,
                explanation: `${a} + ${b} = ${answer}`,
                difficulty: pickRandom(DIFFICULTIES)
            })
        } else {
            const a = Math.floor(Math.random() * 40) + 20
            const b = Math.floor(Math.random() * 15) + 5
            const answer = a - b
            const { options, correctAnswer } = shuffleOptions(
                String(answer),
                [String(answer + 4), String(answer - 3), String(answer + 1)]
            )
            questions.push({
                questionText: `What is ${a} - ${b}?`,
                options,
                correctAnswer,
                explanation: `${a} - ${b} = ${answer}`,
                difficulty: pickRandom(DIFFICULTIES)
            })
        }
    }
    return questions
}

function generateMultiplicationDivision(count) {
    const questions = []
    for (let i = 0; i < count; i++) {
        const a = Math.floor(Math.random() * 12) + 2
        const b = Math.floor(Math.random() * 12) + 2
        const answer = a * b
        const { options, correctAnswer } = shuffleOptions(
            String(answer),
            [String(answer + a), String(answer - b), String(answer + b)]
        )
        questions.push({
            questionText: `What is ${a} × ${b}?`,
            options,
            correctAnswer,
            explanation: `${a} × ${b} = ${answer}`,
            difficulty: pickRandom(DIFFICULTIES)
        })
    }
    return questions
}

function generatePercentages(count) {
    const questions = []
    for (let i = 0; i < count; i++) {
        const pct = pickRandom([10, 15, 20, 25, 30, 40, 50])
        const num = (Math.floor(Math.random() * 20) + 2) * 100
        const answer = (num * pct) / 100
        const { options, correctAnswer } = shuffleOptions(
            String(answer),
            [String(answer + 10), String(answer - 5), String(answer + 20)]
        )
        questions.push({
            questionText: `What is ${pct}% of ${num}?`,
            options,
            correctAnswer,
            explanation: `${pct}% of ${num} = ${answer}`,
            difficulty: pickRandom(DIFFICULTIES)
        })
    }
    return questions
}

function generateNumberSeries(count) {
    const series = [
        { seq: "2, 4, 6, 8", next: 10, exp: "Add 2 each time" },
        { seq: "1, 1, 2, 3, 5", next: 8, exp: "Fibonacci sequence" },
        { seq: "3, 6, 12, 24", next: 48, exp: "Multiply by 2" },
        { seq: "1, 4, 9, 16", next: 25, exp: "Perfect squares" }
    ]
    const questions = []
    for (let i = 0; i < count; i++) {
        const item = series[i % series.length]
        const offset = Math.floor(i / series.length) * 2
        const answer = item.next + offset
        const { options, correctAnswer } = shuffleOptions(
            String(answer),
            [String(answer + 1), String(answer - 2), String(answer + 3)]
        )
        questions.push({
            questionText: `Find the next number: ${item.seq}, ?`,
            options,
            correctAnswer,
            explanation: item.exp,
            difficulty: pickRandom(DIFFICULTIES)
        })
    }
    return questions
}

function generateLogicalPatterns(count) {
    const items = [
        {
            q: "If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops definitely Lazzies?",
            options: ["Yes", "No", "Cannot say", "Only some"],
            correct: 0,
            exp: "Transitive relation: Bloops → Razzies → Lazzies"
        },
        {
            q: "Which does not belong: Circle, Square, Triangle, Apple?",
            options: ["Circle", "Square", "Triangle", "Apple"],
            correct: 3,
            exp: "Apple is not a shape"
        }
    ]
    return repeatItems(items, count)
}

function generateSynonyms(count) {
    const items = [
        {
            q: "Choose the synonym of 'Abundant':",
            options: ["Scarce", "Plentiful", "Tiny", "Weak"],
            correct: 1,
            exp: "Abundant means plentiful"
        },
        {
            q: "Choose the antonym of 'Benevolent':",
            options: ["Kind", "Generous", "Malevolent", "Friendly"],
            correct: 2,
            exp: "Malevolent is the opposite of benevolent"
        },
        {
            q: "Choose the synonym of 'Concise':",
            options: ["Verbose", "Brief", "Lengthy", "Complex"],
            correct: 1,
            exp: "Concise means brief"
        }
    ]
    return repeatItems(items, count)
}

function generateGrammar(count) {
    const items = [
        {
            q: "Fill in the blank: She ___ to the store yesterday.",
            options: ["go", "gone", "went", "going"],
            correct: 2,
            exp: "Past tense of go is went"
        },
        {
            q: "Fill in the blank: Neither John ___ Mary was present.",
            options: ["or", "nor", "and", "but"],
            correct: 1,
            exp: "Neither pairs with nor"
        }
    ]
    return repeatItems(items, count)
}

function generateJavaScript(count) {
    const items = [
        {
            q: "What is the output of: typeof null?",
            options: ["null", "undefined", "object", "number"],
            correct: 2,
            exp: "typeof null returns 'object'"
        },
        {
            q: "Which method adds an element to the end of an array?",
            options: ["push()", "pop()", "shift()", "unshift()"],
            correct: 0,
            exp: "push() adds to the end"
        },
        {
            q: "What does === check?",
            options: ["Value only", "Type only", "Value and type", "Reference"],
            correct: 2,
            exp: "Strict equality checks value and type"
        }
    ]
    return repeatItems(items, count)
}

function generatePython(count) {
    const items = [
        {
            q: "Which keyword defines a function in Python?",
            options: ["function", "def", "func", "define"],
            correct: 1,
            exp: "Python uses def"
        },
        {
            q: "What is the output of: print(3 // 2)?",
            options: ["1.5", "1", "2", "0"],
            correct: 1,
            exp: "// is floor division"
        },
        {
            q: "Which data type is mutable?",
            options: ["tuple", "string", "list", "int"],
            correct: 2,
            exp: "Lists are mutable"
        }
    ]
    return repeatItems(items, count)
}

function generateDataStructures(count) {
    const items = [
        {
            q: "Time complexity of binary search?",
            options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
            correct: 1,
            exp: "Binary search is O(log n)"
        },
        {
            q: "Which structure uses LIFO?",
            options: ["Queue", "Stack", "Tree", "Graph"],
            correct: 1,
            exp: "Stack is Last In First Out"
        }
    ]
    return repeatItems(items, count)
}

function generateDbms(count) {
    const items = [
        {
            q: "ACID stands for?",
            options: [
                "Atomicity, Consistency, Isolation, Durability",
                "Access, Control, Index, Data",
                "Array, Cache, Input, Disk",
                "None of the above"
            ],
            correct: 0,
            exp: "Standard database transaction properties"
        },
        {
            q: "Which key uniquely identifies a row?",
            options: ["Foreign key", "Primary key", "Index", "Super key"],
            correct: 1,
            exp: "Primary key uniquely identifies each row"
        }
    ]
    return repeatItems(items, count)
}

function generateOperatingSystems(count) {
    const items = [
        {
            q: "Which scheduling algorithm is preemptive?",
            options: ["FCFS", "Round Robin", "SJF (non-preemptive)", "FIFO"],
            correct: 1,
            exp: "Round Robin uses time slices"
        },
        {
            q: "Virtual memory uses ___ as an extension of RAM.",
            options: ["CPU cache", "Disk", "GPU", "ROM"],
            correct: 1,
            exp: "Disk space is used for virtual memory"
        }
    ]
    return repeatItems(items, count)
}

function generateGenericQuestions(count) {
    const questions = []
    for (let i = 0; i < count; i++) {
        const a = i + 2
        const b = i + 3
        const answer = a + b
        const { options, correctAnswer } = shuffleOptions(
            String(answer),
            [String(answer + 1), String(answer - 1), String(answer + 2)]
        )
        questions.push({
            questionText: `What is ${a} + ${b}?`,
            options,
            correctAnswer,
            explanation: `${a} + ${b} = ${answer}`,
            difficulty: pickRandom(DIFFICULTIES)
        })
    }
    return questions
}

function repeatItems(items, count) {
    const questions = []
    for (let i = 0; i < count; i++) {
        const item = items[i % items.length]
        questions.push({
            questionText: item.q,
            options: item.options,
            correctAnswer: item.correct,
            explanation: item.exp,
            difficulty: pickRandom(DIFFICULTIES)
        })
    }
    return questions
}
