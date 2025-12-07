import OpenAI from 'openai';
import { Transaction, Category } from '@/contexts/AppContext';

// Placeholder for the default API key - In a real app this should be an env var
// The user promised to provide this, but hasn't yet.
const DEFAULT_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

export interface AIContext {
  transactions: Transaction[];
  budgetCategories: any;
  monthlyIncome: number;
  currency: string;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant' | 'function' | 'tool';
  content: string | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }> | null;
  attachments?: Array<{ url: string; type: 'image' | 'file' }>;
  tool_calls?: any[];
  tool_call_id?: string;
  name?: string;
}

const SYSTEM_PROMPT = `
You are a helpful and knowledgeable financial advisor assistant for the "Budget Pro" application.
Your goal is to help the user manage their finances, track their budget, and provide insights.

You have access to the user's current financial data, including:
- Monthly Income
- Budget Categories (Needs, Desires, Future, Debts)
- Recent Transactions

You can also perform actions on behalf of the user, such as adding new transactions.
You can analyze images provided by the user, such as receipts or invoices, to extract transaction details.

When the user asks to add a transaction, follow this STRICT multi-step process:
1. Gather Details: Ask for date, amount, and description if not provided. Accept natural language dates (e.g., "hoy", "ayer", "lunes pasado") without asking for a specific format. ALWAYS use a bulleted list to ask for missing details or summarize what you understood so far.
2. Category Selection: Call 'requestCategorySelection' to let the user pick a category. Analyze the description and provide 'suggestedCategories' (IDs) that match.
3. Confirmation: Call 'requestConfirmation' with a summary.
4. Execution: ONLY call 'addTransaction' if the user explicitly confirms (e.g., clicks "Ingresar").

If the user clicks "Modificar", restart the relevant step.
Be concise and direct. Do not be conversational.
If the user asks for advice, analyze their spending patterns and budget status to provide personalized recommendations.
Important: Always use the provided Category IDs (UUIDs) for the 'category' parameter.
`;

export class AIService {
  private openai: OpenAI;

  constructor(apiKey?: string) {
    const key = apiKey || DEFAULT_API_KEY;
    this.openai = new OpenAI({
      apiKey: key,
      dangerouslyAllowBrowser: true // Required for client-side usage
    });
  }

  async sendMessage(messages: AIMessage[], context: AIContext) {
    // Prepare the context message
    // Helper to format categories for the AI
    const formatCategories = (categories: any) => {
      const formatted: string[] = [];
      Object.values(categories).forEach((group: any) => {
        group.categories.forEach((cat: any) => {
          formatted.push(`- ${cat.name} (ID: ${cat.id})`);
        });
      });
      return formatted.join('\n');
    };

    // Prepare the context message
    const contextMessage = {
      role: 'system',
      content: `Current Financial Context:
      Monthly Income: ${context.monthlyIncome} ${context.currency}
      
      Available Budget Categories (Use these IDs strictly):
      ${formatCategories(context.budgetCategories)}
      
      Recent Transactions: ${JSON.stringify(context.transactions.slice(-10))}
      `
    };

    // Transform messages for OpenAI API
    // Ensure content is correctly formatted for multimodal inputs and tool_calls are preserved
    const formattedMessages = messages.map(msg => {
      const formatted: any = { role: msg.role };
      
      if (msg.content) {
        formatted.content = msg.content;
      }

      if (msg.tool_calls) {
        formatted.tool_calls = msg.tool_calls;
      }

      if (msg.tool_call_id) {
        formatted.tool_call_id = msg.tool_call_id;
      }
      
      if (msg.name) {
        formatted.name = msg.name;
      }

      return formatted;
    });

    const allMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      contextMessage,
      ...formattedMessages
    ];

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o', // gpt-4o supports vision
        messages: allMessages as any,
        tools: [
          {
            type: 'function',
            function: {
              name: 'addTransaction',
              description: 'Add a new transaction (income or expense) to the budget. ONLY call this after the user has explicitly confirmed the details via the requestConfirmation tool.',
              parameters: {
                type: 'object',
                properties: {
                  description: {
                    type: 'string',
                    description: 'Description of the transaction'
                  },
                  amount: {
                    type: 'number',
                    description: 'Amount of the transaction'
                  },
                  type: {
                    type: 'string',
                    enum: ['income', 'expense'],
                    description: 'Type of transaction'
                  },
                  category: {
                    type: 'string',
                    description: 'Category ID'
                  },
                  date: {
                    type: 'string',
                    description: 'Date of transaction (YYYY-MM-DD)'
                  }
                },
                required: ['description', 'amount', 'type', 'category', 'date']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'requestCategorySelection',
              description: 'Ask the user to select a category from a list. Call this when you have the amount and description but need the category.',
              parameters: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    enum: ['income', 'expense'],
                    description: 'The type of categories to show'
                  },
                  suggestedCategories: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of category IDs that match the transaction description (e.g., ["transport", "dining"])'
                  }
                },
                required: ['type']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'requestConfirmation',
              description: 'Ask the user to confirm the transaction details before adding it. Call this after category selection.',
              parameters: {
                type: 'object',
                properties: {
                  summary: {
                    type: 'string',
                    description: 'A summary of the transaction to be added (e.g., "Gasto de 50€ en Alimentación para hoy")'
                  },
                  transactionData: {
                    type: 'object',
                    description: 'The full transaction data to be passed back to addTransaction if confirmed',
                    properties: {
                      description: { type: 'string' },
                      amount: { type: 'number' },
                      type: { type: 'string' },
                      category: { type: 'string' },
                      date: { type: 'string' }
                    },
                    required: ['description', 'amount', 'type', 'category', 'date']
                  }
                },
                required: ['summary', 'transactionData']
              }
            }
          }
        ],
        tool_choice: 'auto'
      });

      return response.choices[0].message;
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      throw error;
    }
  }
}
