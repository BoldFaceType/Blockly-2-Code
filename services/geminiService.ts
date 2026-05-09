import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn("API_KEY environment variable not found. AI features will be disabled.");
}

const explanationCache = new Map<string, string>();

export const explainPythonCodeStream = async (code: string, onChunk: (chunk: string) => void): Promise<void> => {
  if (!ai) {
    onChunk("AI features are disabled. Please provide a Gemini API key to enable them.");
    return;
  }

  const trimmedCode = code.trim();
  if (explanationCache.has(trimmedCode)) {
    onChunk(explanationCache.get(trimmedCode)!);
    return;
  }

  const prompt = `
    You are an expert Python programmer.
    Concisely explain the following Python code.
    Focus on the code's main purpose and logic.
    Use markdown for formatting.

    Python Code:
    \`\`\`python
    ${trimmedCode || "# The workspace is empty. Add some blocks to get started!"}
    \`\`\`
  `;

  try {
    const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    let fullExplanation = '';
    for await (const chunk of response) {
        const chunkText = chunk.text;
        fullExplanation += chunkText;
        onChunk(chunkText);
    }
    explanationCache.set(trimmedCode, fullExplanation);

  } catch (error) {
    console.error("Error explaining code with Gemini:", error);
    let errorMessage = "An unknown error occurred while explaining the code.";
    if (error instanceof Error) {
        errorMessage = `An error occurred while explaining the code: ${error.message}`;
    }
    onChunk(errorMessage);
  }
};