
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn("API_KEY environment variable not found. AI features will be disabled.");
}

export const explainPythonCode = async (code: string): Promise<string> => {
  if (!ai) {
    return Promise.resolve("AI features are disabled. Please provide a Gemini API key to enable them.");
  }

  const prompt = `
    You are an expert Python programming teacher. 
    Explain the following Python code to a beginner.
    Break down the logic step-by-step. Use a friendly and encouraging tone.
    Use markdown for formatting, including code blocks for snippets and bullet points for clarity.

    Python Code:
    \`\`\`python
    ${code.trim() || "# The workspace is empty. Add some blocks to get started!"}
    \`\`\`
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error explaining code with Gemini:", error);
    if (error instanceof Error) {
        return `An error occurred while explaining the code: ${error.message}`;
    }
    return "An unknown error occurred while explaining the code.";
  }
};
