import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "mock-key-for-development" });

export async function generateProjectSuggestions(projectType: string, projectName: string, projectDescription: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant specialized in project management. Generate helpful suggestions for organizing a new project. Provide suggestions in JSON format with sections, tasks, and resources.",
        },
        {
          role: "user",
          content: `I'm creating a new ${projectType} project called "${projectName}". Description: "${projectDescription}". Please provide suggestions for organizing this project.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content ?? '{}');
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
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant specialized in content analysis. Analyze the provided content and provide insights in JSON format.",
        },
        {
          role: "user",
          content: content,
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content ?? '{}');
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
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            `You are an AI assistant specialized in summarizing content. Create a concise summary of the provided content within approximately ${maxLength} characters. The summary should be clear, readable, and capture the main points.`,
        },
        {
          role: "user",
          content: content,
        },
      ]
    });

    return response.choices[0].message.content ?? "";
  } catch (error) {
    console.error("Error summarizing content:", error);
    return "Unable to generate summary at this time.";
  }
}

export async function generateAssistantResponse(userId: number, projectId: number | null, message: string, context: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
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
      ]
    });

    return response.choices[0].message.content ?? "";
  } catch (error) {
    console.error("Error generating assistant response:", error);
    return "I'm having trouble processing your request right now. Please try again later.";
  }
}

export async function generateProductivityRecommendations(userId: number, workData: any) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
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
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content ?? '[]');
  } catch (error) {
    console.error("Error generating productivity recommendations:", error);
    return [];
  }
}
