import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY not set - AI features will not work");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "sk-dummy" });

// Generate embeddings for semantic similarity matching
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error("Failed to generate embedding");
  }
}

// Calculate cosine similarity between two vectors
export function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Generate AI session agenda
export async function generateSessionAgenda(params: {
  courseName: string;
  topics: string[];
  duration: number;
  examDate?: string;
}): Promise<{
  objectives: string[];
  practiceQuestions: Array<{ question: string; answer: string }>;
  timeSchedule: Array<{ time: string; activity: string }>;
}> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const { courseName, topics, duration, examDate } = params;

  const prompt = `Generate a comprehensive study session agenda for a ${duration}-minute session.

Course: ${courseName}
Topics to cover: ${topics.join(", ")}
${examDate ? `Exam date: ${examDate}` : ""}

Please provide:
1. 3-4 clear learning objectives for this session
2. 4-6 practice questions with answers that test understanding of these topics
3. A time breakdown showing how to allocate the ${duration} minutes effectively

Return the response as a JSON object with this structure:
{
  "objectives": ["objective 1", "objective 2", ...],
  "practiceQuestions": [
    {"question": "...", "answer": "..."},
    ...
  ],
  "timeSchedule": [
    {"time": "0-15 min", "activity": "..."},
    {"time": "15-30 min", "activity": "..."},
    ...
  ]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: "You are an expert study coach who creates effective, focused study session agendas. Provide practical, actionable objectives and challenging practice questions."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("Failed to generate agenda");
  }

  return JSON.parse(content);
}
