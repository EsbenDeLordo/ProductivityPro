import OpenAI from "openai";
import axios from "axios";

// Configuration for AI providers
const AI_PROVIDER = process.env.DEEPSEEK_API_KEY ? "deepseek" : "openai";
const MODEL_NAME = AI_PROVIDER === "deepseek" ? "deepseek-chat" : "gpt-4o";

// Initialize OpenAI client - only used if DEEPSEEK_API_KEY is not set
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "mock-key-for-development" });

// Helper function to call DeepSeek API
async function callDeepSeekAPI(messages: any[], jsonFormat: boolean = false) {
  try {
    const response = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: messages,
        response_format: jsonFormat ? { type: "json_object" } : undefined,
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling DeepSeek API:", error);
    throw error;
  }
}

// Generic function to handle AI completion with either provider
async function getAICompletion(messages: any[], jsonFormat: boolean = false) {
  try {
    if (AI_PROVIDER === "deepseek") {
      return await callDeepSeekAPI(messages, jsonFormat);
    } else {
      const response = await openai.chat.completions.create({
        model: MODEL_NAME,
        messages: messages,
        response_format: jsonFormat ? { type: "json_object" } : undefined,
      });
      return response.choices[0].message.content ?? "";
    }
  } catch (error) {
    console.error(`Error getting AI completion from ${AI_PROVIDER}:`, error);
    throw error;
  }
}

export async function generateProjectSuggestions(projectType: string, projectName: string, projectDescription: string) {
  try {
    const messages = [
      {
        role: "system",
        content:
          "You are an AI assistant specialized in project management. Generate helpful suggestions for organizing a new project. Provide suggestions in JSON format with sections, tasks, and resources.",
      },
      {
        role: "user",
        content: `I'm creating a new ${projectType} project called "${projectName}". Description: "${projectDescription}". Please provide suggestions for organizing this project.`,
      },
    ];

    const content = await getAICompletion(messages, true);
    return JSON.parse(content || '{}');
  } catch (error) {
    console.error("Error generating project suggestions:", error);
    return {
      sections: [],
      tasks: [],
      resources: []
    };
  }
}

export async function analyzeContent(content: string) {
  try {
    const messages = [
      {
        role: "system",
        content:
          "You are an AI assistant specialized in content analysis. Analyze the provided content and provide insights in JSON format.",
      },
      {
        role: "user",
        content: content,
      },
    ];

    const result = await getAICompletion(messages, true);
    return JSON.parse(result || '{}');
  } catch (error) {
    console.error("Error analyzing content:", error);
    return {
      summary: "Error analyzing content",
      suggestions: [],
      keyPoints: []
    };
  }
}

export async function summarizeContent(content: string, maxLength: number = 500) {
  try {
    const messages = [
      {
        role: "system",
        content:
          `You are an AI assistant specialized in summarizing content. Create a concise summary of the provided content within approximately ${maxLength} characters. The summary should be clear, readable, and capture the main points.`,
      },
      {
        role: "user",
        content: content,
      },
    ];

    return await getAICompletion(messages, false);
  } catch (error) {
    console.error("Error summarizing content:", error);
    return "Unable to generate summary at this time.";
  }
}

export async function extractKeyPoints(content: string, maxPoints: number = 5) {
  try {
    const messages = [
      {
        role: "system",
        content:
          `You are an AI assistant specialized in extracting key actionable points from content. 
          Extract exactly ${maxPoints} important points from the provided content.
          Each point should be concise, clear, and focus on actionable information.
          Format as a numbered list with one key point per line.`,
      },
      {
        role: "user",
        content: content,
      },
    ];

    return await getAICompletion(messages, false);
  } catch (error) {
    console.error("Error extracting key points:", error);
    return "Unable to extract key points at this time.";
  }
}

export async function generateAssistantResponse(userId: number, projectId: number | null, message: string, context: string) {
  try {
    const messages = [
      {
        role: "system",
        content:
          `You are an AI assistant in a productivity app called Pocket Huberman Pro. 
          You help users with their projects by providing suggestions, organizing information, and answering questions.
          Context about the current project: ${context}`,
      },
      {
        role: "user",
        content: message,
      },
    ];

    return await getAICompletion(messages, false);
  } catch (error) {
    console.error("Error generating assistant response:", error);
    return "I'm having trouble processing your request right now. Please try again later.";
  }
}

export async function generateProductivityRecommendations(userId: number, workData: any) {
  try {
    const messages = [
      {
        role: "system",
        content:
          `You are an AI assistant in a productivity app called Pocket Huberman Pro.
          Generate 1-3 personalized productivity recommendations based on the user's work data.
          Respond with JSON in the format: 
          [{ "type": string, "title": string, "description": string, "icon": string, "actionText": string, "secondaryActionText": string }]
          
          For icon, use one of: tips_and_updates, local_drink, fitness_center, psychology, hotel, visibility, schedule, brightness_5
          Keep recommendations brief, practical and science-based (inspired by Andrew Huberman's approach to productivity).`,
      },
      {
        role: "user",
        content: `Generate productivity recommendations based on this work data: ${JSON.stringify(workData)}`,
      },
    ];

    const content = await getAICompletion(messages, true);
    return JSON.parse(content || '[]');
  } catch (error) {
    console.error("Error generating productivity recommendations:", error);
    return [];
  }
}
