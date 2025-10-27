// OpenRouter AI API integration
export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
  architecture?: {
    modality?: string;
    tokenizer?: string;
  };
  top_provider?: {
    context_length?: number;
    max_completion_tokens?: number;
  };
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  created: number;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1";

// Cache for free models (refresh every 6 hours) - scoped by API key
const modelCache = new Map<string, { models: Array<{ id: string; name: string; category: string }>; timestamp: number }>();
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

// Simple hash function for API key (for cache keying)
function hashApiKey(apiKey: string): string {
  // Use a simple hash to avoid storing raw API keys
  let hash = 0;
  for (let i = 0; i < apiKey.length; i++) {
    const char = apiKey.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

// Categorize models based on ID and description
function categorizeModel(model: OpenRouterModel): string {
  const id = model.id.toLowerCase();
  const name = model.name?.toLowerCase() || "";
  
  if (id.includes("vision") || id.includes("vl") || id.includes("multimodal") || name.includes("vision")) {
    return "Multimodal";
  }
  if (id.includes("reasoning") || id.includes("r1") || name.includes("reasoning") || name.includes("thinking")) {
    return "Reasoning";
  }
  if (id.includes("code") || id.includes("coder") || name.includes("code")) {
    return "Coding";
  }
  if (id.includes("flash") || id.includes("nano") || name.includes("fast") || name.includes("speed")) {
    return "Speed";
  }
  if (id.includes("instruct") || name.includes("instruct")) {
    return "Instruction";
  }
  if (id.includes("ultra") || id.includes("large") || id.includes("253b") || id.includes("405b")) {
    return "Large";
  }
  return "General";
}

// Known problematic models that produce gibberish or unreliable outputs
const BLOCKED_MODELS = [
  "arliai/qwq-32b-arliai-rpr-v1:free",
  "arliai/llama-3.1-8b-arliai-rpr-v1:free",
  "agentica-org/deepcoder-14b-preview:free", // Returns 404 model not found
  // Add more problematic models as discovered
];

// Fetch truly free and working models from OpenRouter
export async function getFreeModels(apiKey: string): Promise<Array<{ id: string; name: string; category: string }>> {
  if (!apiKey) {
    throw new Error("API key is required");
  }

  const keyHash = hashApiKey(apiKey);
  const cached = modelCache.get(keyHash);
  
  // Return cached models if still valid for this API key
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.models;
  }

  try {
    const allModels = await fetchOpenRouterModels(apiKey);
    
    // Filter for truly free models (pricing.prompt === "0") and exclude blocked models
    const freeModels = allModels
      .filter(model => {
        const promptPrice = parseFloat(model.pricing.prompt);
        const completionPrice = parseFloat(model.pricing.completion);
        const isFree = promptPrice === 0 && completionPrice === 0;
        const isNotBlocked = !BLOCKED_MODELS.includes(model.id);
        return isFree && isNotBlocked;
      })
      .map(model => ({
        id: model.id,
        name: model.name,
        category: categorizeModel(model),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Cache the results for this API key
    modelCache.set(keyHash, {
      models: freeModels,
      timestamp: Date.now(),
    });

    console.log(`✓ Found ${freeModels.length} free working OpenRouter models (${BLOCKED_MODELS.length} blocked)`);
    return freeModels;
  } catch (error) {
    console.error("Error fetching free models:", error);
    
    // If API fails and we have cached data for this key, return it even if expired
    if (cached) {
      console.log("Using expired cache due to API error");
      return cached.models;
    }
    
    // Last resort: return a minimal set of known working models
    return [
      { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B", category: "Instruction" },
      { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash", category: "Speed" },
    ];
  }
}

// Check if a model ID is currently valid (exists in free models list)
// Returns: true (valid), false (invalid), null (unable to verify)
export async function isValidModel(apiKey: string, modelId: string): Promise<boolean | null> {
  try {
    const freeModels = await getFreeModels(apiKey);
    
    // If we only got the fallback minimal list, we can't reliably validate
    // Return null to indicate "unknown" status
    if (freeModels.length <= 2) {
      console.warn("Using minimal fallback models - cannot reliably validate");
      return null;
    }
    
    return freeModels.some(model => model.id === modelId);
  } catch (error) {
    console.error("Error validating model:", error);
    return null; // Return null instead of false when validation fails
  }
}

export async function fetchOpenRouterModels(apiKey: string): Promise<OpenRouterModel[]> {
  try {
    const response = await fetch(`${OPENROUTER_API_URL}/models`, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching OpenRouter models:", error);
    throw error;
  }
}

// Sanitize and validate content to ensure it's clean text
function sanitizeContent(content: string | null | undefined): string {
  if (!content) return "No response";
  
  // Convert to string and remove null bytes
  let sanitized = String(content).replace(/\0/g, '');
  
  // Remove excessive whitespace and control characters except newlines/tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  // Trim and ensure we have actual content
  sanitized = sanitized.trim();
  
  if (!sanitized || sanitized.length === 0) {
    return "No response";
  }
  
  return sanitized;
}

export async function createChatCompletion(
  apiKey: string,
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  try {
    // Ensure we request text-only responses
    const requestBody = {
      ...request,
      // Don't allow function calling or tool use that could return non-text
      tools: undefined,
      tool_choice: undefined,
    };

    const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL || "http://localhost:5000",
        "X-Title": "AI Nexus",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = `OpenRouter API error: ${response.status} ${response.statusText}`;
      console.error(errorMessage, errorData);
      throw new Error(`${errorMessage} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    // Validate and sanitize the response content
    if (data.choices && data.choices.length > 0) {
      for (let i = 0; i < data.choices.length; i++) {
        const choice = data.choices[i];
        if (choice.message && choice.message.content) {
          // Sanitize the content to remove gibberish/control characters
          choice.message.content = sanitizeContent(choice.message.content);
        }
      }
    }
    
    return data;
  } catch (error) {
    console.error("Error creating chat completion:", error);
    throw error;
  }
}

// Execute team tasks in COLLABORATIVE mode (sequential, each bot sees previous outputs)
export async function executeCollaborativeTeamTasks(
  apiKey: string,
  brief: string,
  delegations: Array<{ botId: string; botName: string; model: string; systemPrompt: string; task: string; temperature: number; maxTokens: number }>
): Promise<Array<{ botId: string; botName: string; task: string; output: string; status: "success" | "error"; error?: string }>> {
  const results: Array<{ botId: string; botName: string; task: string; output: string; status: "success" | "error"; error?: string }> = [];
  const previousOutputs: Array<{ botName: string; task: string; output: string }> = [];

  // Execute bots sequentially, each seeing previous outputs
  for (const delegation of delegations) {
    try {
      const messages: ChatMessage[] = [];
      
      if (delegation.systemPrompt) {
        messages.push({
          role: "system",
          content: delegation.systemPrompt,
        });
      }
      
      // Build context with brief and all previous bot outputs
      let userMessage = `PROJECT BRIEF:\n${brief}\n\nYOUR SPECIFIC TASK:\n${delegation.task}\n\n`;
      
      if (previousOutputs.length > 0) {
        userMessage += `PREVIOUS TEAM MEMBERS' WORK:\n`;
        userMessage += `(You can build upon, reference, or incorporate these outputs in your response)\n\n`;
        
        previousOutputs.forEach((prev, idx) => {
          userMessage += `${idx + 1}. ${prev.botName} (${prev.task}):\n${prev.output}\n\n`;
        });
        
        userMessage += `---\n\nNow, complete YOUR task while considering the work done by your teammates above. You may reference, build upon, or synthesize their contributions as needed.\n`;
      } else {
        userMessage += `You are the first team member to work on this project. Complete your task to set the foundation for the rest of the team.\n`;
      }
      
      messages.push({
        role: "user",
        content: userMessage,
      });

      const response = await createChatCompletion(apiKey, {
        model: delegation.model,
        messages,
        temperature: delegation.temperature,
        max_tokens: delegation.maxTokens,
      });

      const output = response.choices[0]?.message?.content || "No response";
      
      const result = {
        botId: delegation.botId,
        botName: delegation.botName,
        task: delegation.task,
        output,
        status: "success" as const,
      };
      
      results.push(result);
      previousOutputs.push({
        botName: delegation.botName,
        task: delegation.task,
        output,
      });
    } catch (error: any) {
      const errorResult = {
        botId: delegation.botId,
        botName: delegation.botName,
        task: delegation.task,
        output: "",
        status: "error" as const,
        error: error?.message || "Unknown error",
      };
      
      results.push(errorResult);
      
      // Add error to previous outputs so next bots know this one failed
      previousOutputs.push({
        botName: delegation.botName,
        task: delegation.task,
        output: `⚠️ Error: ${error?.message || "Failed to complete task"}`,
      });
    }
  }

  return results;
}

// Execute team tasks in PARALLEL mode (original behavior, for backward compatibility)
export async function executeTeamTasks(
  apiKey: string,
  brief: string,
  delegations: Array<{ botId: string; botName: string; model: string; systemPrompt: string; task: string; temperature: number; maxTokens: number }>
): Promise<Array<{ botId: string; botName: string; task: string; output: string; status: "success" | "error"; error?: string }>> {
  const results = await Promise.allSettled(
    delegations.map(async (delegation) => {
      const messages: ChatMessage[] = [];
      
      if (delegation.systemPrompt) {
        messages.push({
          role: "system",
          content: delegation.systemPrompt,
        });
      }
      
      messages.push({
        role: "user",
        content: `PROJECT BRIEF:\n${brief}\n\nYOUR SPECIFIC TASK:\n${delegation.task}\n\nPlease complete your assigned task based on the project brief above.`,
      });

      const response = await createChatCompletion(apiKey, {
        model: delegation.model,
        messages,
        temperature: delegation.temperature,
        max_tokens: delegation.maxTokens,
      });

      return {
        botId: delegation.botId,
        botName: delegation.botName,
        task: delegation.task,
        output: response.choices[0]?.message?.content || "No response",
        status: "success" as const,
      };
    })
  );

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    } else {
      return {
        botId: delegations[index].botId,
        botName: delegations[index].botName,
        task: delegations[index].task,
        output: "",
        status: "error" as const,
        error: result.reason?.message || "Unknown error",
      };
    }
  });
}
