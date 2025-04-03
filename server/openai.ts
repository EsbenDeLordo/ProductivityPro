import axios from "axios";

// DeepSeek API configuration
const DEEPSEEK_API_MOCK = "sk-mock-key-for-development";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
console.log("DeepSeek API Key status:", DEEPSEEK_API_KEY ? "Available" : "Not available");

// Helper function to call DeepSeek API
async function callDeepSeekAPI(messages: any[], jsonFormat: boolean = false) {
  try {
    // If no API key is available, return an appropriate mock response based on the context
    if (!DEEPSEEK_API_KEY) {
      const context = messages[0]?.content || "";
      const userQuery = messages[1]?.content || "";
      
      // Generate more specific mock responses based on the query type
      if (jsonFormat) {
        if (context.includes("productivity recommendations")) {
          return `[
            {
              "type": "break",
              "title": "Take a strategic break",
              "description": "Regular breaks improve focus and cognitive function. Try the 50-10 rule: 50 minutes of work followed by a 10-minute break.",
              "icon": "schedule",
              "actionText": "Set timer",
              "secondaryActionText": "Learn more"
            },
            {
              "type": "hydration",
              "title": "Hydration reminder",
              "description": "Your hydration status is low. Proper hydration supports optimal brain function and energy levels.",
              "icon": "local_drink",
              "actionText": "Set reminder",
              "secondaryActionText": "Track intake"
            }
          ]`;
        } else if (context.includes("content analysis")) {
          return `{
            "summary": "This content appears to be a placeholder or sample. For detailed analysis, please provide your actual content.",
            "keyPoints": ["Sample key point 1", "Sample key point 2", "Sample key point 3"],
            "suggestions": ["Consider expanding this content", "Add specific examples", "Include references"]
          }`;
        } else if (context.includes("project management")) {
          return `{
            "sections": ["Research", "Outline", "Draft", "Review", "Final Version"],
            "tasks": [
              {"name": "Gather reference materials", "section": "Research", "priority": "High"},
              {"name": "Create content structure", "section": "Outline", "priority": "Medium"},
              {"name": "Write first draft", "section": "Draft", "priority": "Medium"}
            ],
            "resources": ["Productivity podcasts", "Scientific journals", "Online courses"]
          }`;
        } else {
          return `{"status": "mock", "message": "This is a mock response. For actual AI responses, please provide a valid DeepSeek API key."}`;
        }
      } else {
        // Text format responses
        if (userQuery.includes("analyze") || userQuery.includes("summarize")) {
          return "This is a mock content analysis. The content appears to be about productivity and work management. Key points include the importance of regular breaks, proper hydration, and strategic planning of tasks. For detailed AI analysis, please provide a valid DeepSeek API key.";
        } else if (userQuery.includes("help") || userQuery.includes("project")) {
          return "I can help with project organization! Consider breaking your project into clear phases: Research, Planning, Execution, and Review. For each phase, define specific deliverables and timelines. Use the built-in project tools in Pocket WinDryft Pro to track progress. For more personalized assistance, please provide a valid DeepSeek API key.";
        } else if (userQuery.includes("idea")) {
          return "Here are some project ideas: 1) Create a high-performance morning routine optimization guide, 2) Develop a tracking system for your key performance metrics, 3) Design a custom note-taking template for meeting insights. For personalized ideas, please provide a valid DeepSeek API key.";
        } else {
          return "Welcome to Pocket WinDryft Pro! This is a mock response because no DeepSeek API key is set. For real AI-powered assistance, please provide a valid API key in your environment settings.";
        }
      }
    }
    
    const response = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: messages,
        response_format: jsonFormat ? { type: "json_object" } : undefined,
      },
      {
        headers: {
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling DeepSeek API:", error);
    
    // Fallback to mock responses on error
    if (jsonFormat) {
      if (messages[0]?.content?.includes("productivity recommendations")) {
        return `[
          {
            "type": "break",
            "title": "Take a strategic break",
            "description": "Regular breaks improve focus and cognitive function. Try the 50-10 rule: 50 minutes of work followed by a 10-minute break.",
            "icon": "schedule",
            "actionText": "Set timer",
            "secondaryActionText": "Learn more"
          },
          {
            "type": "focus",
            "title": "Focus enhancement",
            "description": "Try the Pomodoro technique: 25-minute focused work sessions with 5-minute breaks. This can significantly improve productivity.",
            "icon": "psychology",
            "actionText": "Start pomodoro",
            "secondaryActionText": "Customize"
          }
        ]`;
      } else {
        return `{"error": false, "message": "Using fallback response", "data": {"status": "mock"}}`;
      }
    } else {
      return "I'm currently using a fallback response mode. For the best experience, please ensure your DeepSeek API key is valid and your internet connection is stable.";
    }
  }
}

// Function to handle AI completion
async function getAICompletion(messages: any[], jsonFormat: boolean = false) {
  try {
    return await callDeepSeekAPI(messages, jsonFormat);
  } catch (error) {
    console.error(`Error getting AI completion:`, error);
    return jsonFormat 
      ? '{"error": true, "message": "Failed to process AI request"}'
      : "Failed to process AI request. Please try again later.";
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
    
    try {
      return JSON.parse(content || '{}');
    } catch (parseError) {
      console.error("Error parsing JSON from project suggestions:", parseError);
      // Return a default response if JSON parsing fails
      return {
        sections: ["Research", "Planning", "Implementation", "Review"],
        tasks: [
          { name: "Define project scope", section: "Planning", priority: "High" },
          { name: "Gather materials", section: "Research", priority: "Medium" },
          { name: "Create outline", section: "Planning", priority: "Medium" }
        ],
        resources: ["Productivity books", "Online tutorials", "Research podcasts"]
      };
    }
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
    
    try {
      return JSON.parse(result || '{}');
    } catch (parseError) {
      console.error("Error parsing JSON from content analysis:", parseError);
      // Return a default response if JSON parsing fails
      return {
        summary: "Analysis completed, but encountered an error formatting the results",
        suggestions: ["Try providing more detailed content for better analysis"],
        keyPoints: ["Unable to extract key points from the provided content"]
      };
    }
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
          `You are an AI assistant in a productivity app called Pocket WinDryft Pro. 
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
          `You are an AI assistant in a productivity app called Pocket WinDryft Pro.
          Generate 1-3 personalized productivity recommendations based on the user's work data.
          Respond with JSON in the format: 
          [{ "type": string, "title": string, "description": string, "icon": string, "actionText": string, "secondaryActionText": string }]
          
          For icon, use one of: tips_and_updates, local_drink, fitness_center, psychology, hotel, visibility, schedule, brightness_5
          Keep recommendations brief, practical and science-based (focused on high-performance productivity techniques).`,
      },
      {
        role: "user",
        content: `Generate productivity recommendations based on this work data: ${JSON.stringify(workData)}`,
      },
    ];

    const content = await getAICompletion(messages, true);
    
    try {
      return JSON.parse(content || '[]');
    } catch (parseError) {
      console.error("Error parsing JSON from productivity recommendations:", parseError);
      // Return default recommendations if JSON parsing fails
      return [
        {
          type: "break",
          title: "Schedule strategic breaks",
          description: "Taking short breaks every 50-90 minutes can help maintain optimal focus and cognitive function throughout your workday.",
          icon: "schedule",
          actionText: "Set break timer",
          secondaryActionText: "Learn more"
        },
        {
          type: "focus",
          title: "Morning sunlight exposure",
          description: "Getting 10-30 minutes of morning sunlight exposure can help regulate your circadian rhythm and improve focus during the day.",
          icon: "brightness_5",
          actionText: "Set reminder",
          secondaryActionText: "Read research"
        }
      ];
    }
  } catch (error) {
    console.error("Error generating productivity recommendations:", error);
    return [];
  }
}
