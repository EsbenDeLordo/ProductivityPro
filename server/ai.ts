import axios from "axios";
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

// API keys configuration
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Initialize Anthropic if API key is available
const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;

// Log available providers
console.log("AI Providers Status:");
console.log("- DeepSeek API: ", DEEPSEEK_API_KEY ? "Available" : "Not available");
console.log("- Gemini API: ", GEMINI_API_KEY ? "Available" : "Not available");
console.log("- Anthropic API: ", ANTHROPIC_API_KEY ? "Available" : "Not available");

// AI Provider types
export type AIProvider = 'deepseek' | 'gemini' | 'anthropic' | 'auto';

// Helper function to choose the best available provider
function chooseProvider(requestedProvider: AIProvider): AIProvider {
  if (requestedProvider === 'auto') {
    // Choose the first available provider in order of preference
    if (GEMINI_API_KEY) return 'gemini';  // Prioritize Gemini since it has a free tier
    if (ANTHROPIC_API_KEY) return 'anthropic';
    if (DEEPSEEK_API_KEY) return 'deepseek';
    return 'gemini'; // Default to Gemini for mock responses
  }
  
  // If specifically requested provider is not available, fall back to auto
  if (requestedProvider === 'anthropic' && !ANTHROPIC_API_KEY) {
    console.log('Anthropic API key not available, falling back to auto selection');
    return chooseProvider('auto');
  }
  
  if (requestedProvider === 'gemini' && !GEMINI_API_KEY) {
    console.log('Gemini API key not available, falling back to auto selection');
    return chooseProvider('auto');
  }
  
  if (requestedProvider === 'deepseek' && !DEEPSEEK_API_KEY) {
    console.log('DeepSeek API key not available, falling back to auto selection');
    return chooseProvider('auto');
  }
  
  // If specifically requested and available, use that provider
  return requestedProvider;
}

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
          return "This is a mock content analysis. The content appears to be about productivity and work management. Key points include the importance of regular breaks, proper hydration, and strategic planning of tasks. For detailed AI analysis, please provide a valid API key.";
        } else if (userQuery.includes("help") || userQuery.includes("project")) {
          return "I can help with project organization! Consider breaking your project into clear phases: Research, Planning, Execution, and Review. For each phase, define specific deliverables and timelines. Use the built-in project tools in Pocket WinDryft Pro to track progress. For more personalized assistance, please provide a valid API key.";
        } else if (userQuery.includes("idea")) {
          return "Here are some project ideas: 1) Create a high-performance morning routine optimization guide, 2) Develop a tracking system for your key performance metrics, 3) Design a custom note-taking template for meeting insights. For personalized ideas, please provide a valid API key.";
        } else {
          return "I'm currently in demo mode with limited capabilities. For the full AI experience, please ask the administrator to add an API key to the server environment variables.";
        }
      }
    }
    
    // Making the API call with better error handling
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
            "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      // removed duplicate return
    } catch (apiError: any) {
      console.error("DeepSeek API error details:", 
        apiError.response?.status,
        apiError.response?.data
      );
      
      // If payment required error, provide a clear message
      if (apiError.response?.status === 402) {
        throw new Error("DeepSeek API subscription issue: Payment required. The API key may have billing issues.");
      }
      
      throw apiError; // Rethrow for the outer catch block to handle
    }
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
      return "I'm currently in demo mode with limited capabilities. For the full AI experience, please ask the administrator to add a DeepSeek API key to the server environment variables.";
    }
  }
}

// Helper function to call Gemini API
async function callGeminiAPI(messages: any[], jsonFormat: boolean = false) {
  try {
    if (!GEMINI_API_KEY) {
      return "I'm currently in demo mode with limited capabilities. For the full AI experience, please ask the administrator to add a Gemini API key to the server environment variables.";
    }

    // Initialize the Gemini API
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Format messages for Gemini
    // Convert from OpenAI format to Gemini format
    const geminiMessages = messages.map(msg => ({
      role: msg.role === 'system' ? 'user' : msg.role, // Gemini doesn't have system role
      parts: [{ text: msg.content }]
    }));
    
    // If we have a system message, prepend it to the first user message
    if (messages.length > 0 && messages[0].role === 'system') {
      // Remove the system message from geminiMessages
      geminiMessages.shift();
      
      // If there are user messages, prepend the system content
      if (geminiMessages.length > 0) {
        // Extract the first user message
        const firstUserMessage = geminiMessages[0];
        
        // Prepend system message to the user message
        firstUserMessage.parts[0].text = `${messages[0].content}\n\n${firstUserMessage.parts[0].text}`;
      }
    }

    // If expecting JSON output, add that instruction
    if (jsonFormat) {
      // Add instruction to format response as JSON
      const lastMessage = geminiMessages[geminiMessages.length - 1];
      lastMessage.parts[0].text += "\n\nPlease format your response as a valid JSON object.";
    }

    // Create a chat session
    const chat = model.startChat({
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1000,
      },
      // Safety settings using the proper enum values from the SDK
      safetySettings: [
        {
          category: "harassment",
          threshold: "block_medium_and_above"
        },
        {
          category: "hate_speech",
          threshold: "block_medium_and_above"
        },
        {
          category: "sexually_explicit",
          threshold: "block_medium_and_above"
        },
        {
          category: "dangerous_content",
          threshold: "block_medium_and_above"
        }
      ]
    });

    // Send the last user message to the chat
    const lastUserMessage = geminiMessages[geminiMessages.length - 1];
    const result = await chat.sendMessage(lastUserMessage.parts[0].text);
    const response = result.response;
    
    return response.text();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Sorry, I encountered an error while processing your request with Gemini. Could you try again or switch to a different AI provider?";
  }
}

// Helper function to call Anthropic API
async function callAnthropicAPI(messages: any[], jsonFormat: boolean = false) {
  try {
    if (!ANTHROPIC_API_KEY || !anthropic) {
      return "I'm currently in demo mode with limited capabilities. For the full Claude experience, please add an Anthropic API key to the server environment.";
    }

    // Format messages for Anthropic (convert from OpenAI format)
    const anthropicMessages = messages.map(msg => ({
      role: msg.role === 'system' ? 'assistant' : msg.role, // Map 'system' to 'assistant'
      content: msg.content
    }));
    
    // Add system message as a separate message if needed
    if (messages.length > 0 && messages[0].role === 'system') {
      // Set it as system instruction instead
      const systemContent = messages[0].content;
      
      // If JSON is expected, add that instruction
      const responseFormat = jsonFormat ? 
        { type: "json_object" } : 
        undefined;
      
      const response = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219", // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
        max_tokens: 1000,
        temperature: 0.7,
        system: systemContent,
        messages: anthropicMessages.slice(1), // Skip the first message (system)
        response_format: responseFormat
      });
      
      return response.content[0].text;
    } else {
      // No system message, just use the messages directly
      const responseFormat = jsonFormat ? 
        { type: "json_object" } : 
        undefined;
      
      const response = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219", // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
        max_tokens: 1000,
        temperature: 0.7,
        messages: anthropicMessages,
        response_format: responseFormat
      });
      
      return response.content[0].text;
    }
  } catch (error) {
    console.error("Error calling Anthropic API:", error);
    return "Sorry, I encountered an error while processing your request with Claude. Could you try again or switch to a different AI provider?";
  }
}

// Function to handle AI completion
export async function getAICompletion(messages: any[], jsonFormat: boolean = false, provider: AIProvider = 'auto') {
  try {
    const selectedProvider = chooseProvider(provider);
    console.log(`Using AI provider: ${selectedProvider}`);
    
    // Call the appropriate API based on the selected provider
    if (selectedProvider === 'deepseek') {
      return await callDeepSeekAPI(messages, jsonFormat);
    } else if (selectedProvider === 'gemini') {
      return await callGeminiAPI(messages, jsonFormat);
    } else if (selectedProvider === 'anthropic') {
      return await callAnthropicAPI(messages, jsonFormat);
    }
    
    // Fallback to DeepSeek if no valid provider is selected
    return await callDeepSeekAPI(messages, jsonFormat);
  } catch (error) {
    console.error(`Error getting AI completion:`, error);
    return jsonFormat 
      ? '{"error": true, "message": "Failed to process AI request"}'
      : "Failed to process AI request. Please try again later.";
  }
}

export async function generateProjectSuggestions(projectType: string, projectName: string, projectDescription: string, provider: AIProvider = 'auto') {
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

    const content = await getAICompletion(messages, true, provider);
    
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

export async function analyzeContent(content: string, provider: AIProvider = 'auto') {
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

    const result = await getAICompletion(messages, true, provider);
    
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

export async function summarizeContent(content: string, maxLength: number = 500, provider: AIProvider = 'auto') {
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

    return await getAICompletion(messages, false, provider);
  } catch (error) {
    console.error("Error summarizing content:", error);
    return "Unable to generate summary at this time.";
  }
}

export async function extractKeyPoints(content: string, maxPoints: number = 5, provider: AIProvider = 'auto') {
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

    return await getAICompletion(messages, false, provider);
  } catch (error) {
    console.error("Error extracting key points:", error);
    return "Unable to extract key points at this time.";
  }
}

export async function generateAssistantResponse(userId: number, projectId: number | null, message: string, context: string, provider: AIProvider = 'auto') {
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

    return await getAICompletion(messages, false, provider);
  } catch (error) {
    console.error("Error generating assistant response:", error);
    return "I'm having trouble processing your request right now. Please try again later.";
  }
}

export async function generateProductivityRecommendations(userId: number, workData: any, provider: AIProvider = 'auto') {
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

    const content = await getAICompletion(messages, true, provider);
    
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