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
  currentMonthTransactions?: Transaction[];
  monthlyIncome?: number;
  totalSpentThisMonth?: number;
  budgetSummary?: {
    needs: { budgeted: number; spent: number };
    desires: { budgeted: number; spent: number };
    future: { budgeted: number; spent: number };
    debts: { budgeted: number; spent: number };
  };
  remainingBudget?: number;
  daysLeftInMonth?: number;
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

You have access to the user's COMPLETE financial data, including:
- Monthly Income and Currency
- Budget Categories (Needs, Desires, Future, Debts) with allocated budgets and current spending
- ALL transactions from the current month
- Budget Summary showing how much has been spent in each category vs. budgeted amounts
- Total spent this month
- Remaining budget
- Days left in the month

Use this comprehensive data to provide CONTEXTUAL and PERSONALIZED advice.
For example:
- When asked "How much can I spend today?", consider the remaining budget, days left, and pending bills
- When analyzing spending, look at actual transactions and compare against budget
- When giving recommendations, base them on the user's real spending patterns

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
Important: NEVER display Category IDs to the user in your text response. Only use the Name.

You have advanced capabilities:
- "How much can I spend today?": Use 'getDailySpendingLimit'.
- Budget Optimization: Use 'getSpendingAnalysis' to find trends, then suggest changes. If user agrees, use 'updateBudget'.
- Savings & Investments: Analyze 'future' bucket and suggest increasing contributions based on 'getSpendingAnalysis'. Provide general investment advice based on risk profiles (Conservative, Moderate, Aggressive).
- Expense Cutting: Identify recurring/high expenses in 'desires' via 'getSpendingAnalysis' and suggest cuts.
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

    // Prepare comprehensive financial summary
    const calculatePercentage = (spent: number, budgeted: number) => {
      if (budgeted === 0) return '0.0';
      return ((spent / budgeted) * 100).toFixed(1);
    };

    const budgetSummaryText = context.budgetSummary
      ? `Budget Summary This Month:
      - Needs: ${context.budgetSummary.needs.spent}/${context.budgetSummary.needs.budgeted} ${context.currency} (${calculatePercentage(context.budgetSummary.needs.spent, context.budgetSummary.needs.budgeted)}% used)
      - Desires: ${context.budgetSummary.desires.spent}/${context.budgetSummary.desires.budgeted} ${context.currency} (${calculatePercentage(context.budgetSummary.desires.spent, context.budgetSummary.desires.budgeted)}% used)
      - Future/Savings: ${context.budgetSummary.future.spent}/${context.budgetSummary.future.budgeted} ${context.currency} (${calculatePercentage(context.budgetSummary.future.spent, context.budgetSummary.future.budgeted)}% used)
      - Debts: ${context.budgetSummary.debts.spent}/${context.budgetSummary.debts.budgeted} ${context.currency} (${calculatePercentage(context.budgetSummary.debts.spent, context.budgetSummary.debts.budgeted)}% used)

      Total Spent This Month: ${context.totalSpentThisMonth || 0} ${context.currency}
      Remaining Budget: ${context.remainingBudget || 0} ${context.currency}
      Days Left in Month: ${context.daysLeftInMonth || 0}`
      : '';

    // Prepare the context message
    const contextMessage = {
      role: 'system',
      content: `Current Financial Context:
      Monthly Income: ${context.monthlyIncome} ${context.currency}

      ${budgetSummaryText}

      Available Budget Categories (Use these IDs strictly):
      ${formatCategories(context.budgetCategories)}

      Current Month Transactions (${context.currentMonthTransactions?.length || 0} total):
      ${JSON.stringify(context.currentMonthTransactions || context.transactions.slice(-10))}
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
          },
          {
            type: 'function',
            function: {
              name: 'getMonthlyTransactions',
              description: 'Fetch transactions for a specific month and year. Use this when the user asks about past spending, specific months, or trends.',
              parameters: {
                type: 'object',
                properties: {
                  month: {
                    type: 'number',
                    description: 'Month number (1-12)'
                  },
                  year: {
                    type: 'number',
                    description: 'Year (e.g., 2024)'
                  }
                },
                required: ['month', 'year']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'getDailySpendingLimit',
              description: 'Calculate how much the user can spend today without breaking the monthly budget. Returns the calculated daily limit and context.',
              parameters: {
                type: 'object',
                properties: {},
                required: []
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'getSpendingAnalysis',
              description: 'Analyze spending habits over the last few months to identify trends, recurring expenses, and opportunities for saving.',
              parameters: {
                type: 'object',
                properties: {
                  monthsToAnalyze: {
                    type: 'number',
                    description: 'Number of past months to analyze (default: 3)'
                  }
                },
                required: []
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'updateBudget',
              description: 'Update the budgeted amount or percentage for a specific category. Use this to implement personalized budget recommendations.',
              parameters: {
                type: 'object',
                properties: {
                  categoryType: {
                    type: 'string',
                    enum: ['needs', 'desires', 'future', 'debts'],
                    description: 'The main budget bucket'
                  },
                  categoryId: {
                    type: 'string',
                    description: 'The specific category ID'
                  },
                  updates: {
                    type: 'object',
                    description: 'Fields to update (budgeted amount)',
                    properties: {
                      budgeted: { type: 'number' }
                    },
                    required: ['budgeted']
                  }
                },
                required: ['categoryType', 'categoryId', 'updates']
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
  async transcribeAudio(audioFile: File): Promise<string> {
    try {
      const response = await this.openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'es' // Hint for Spanish
      });
      return response.text;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    }
  }
}
