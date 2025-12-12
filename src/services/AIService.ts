import OpenAI from 'openai';
import { Transaction, Category } from '@/contexts/AppContext';
import { ComprehensiveFinancialData } from './FinancialDataService';

// Placeholder for the default API key - In a real app this should be an env var
// The user promised to provide this, but hasn't yet.
const DEFAULT_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

export interface AIContext {
  // Legacy context (for backward compatibility)
  transactions: Transaction[];
  budgetCategories: any;
  monthlyIncome: number;
  currency: string;
  currentMonthTransactions?: Transaction[];
  totalSpentThisMonth?: number;
  budgetSummary?: {
    needs: { budgeted: number; spent: number };
    desires: { budgeted: number; spent: number };
    future: { budgeted: number; spent: number };
    debts: { budgeted: number; spent: number };
  };
  remainingBudget?: number;
  daysLeftInMonth?: number;

  // NEW: Comprehensive financial data
  comprehensiveData?: ComprehensiveFinancialData;
  currentMonth?: number;
  currentYear?: number;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant' | 'function' | 'tool';
  content: string | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }> | null;
  attachments?: Array<{ url: string; type: 'image' | 'file' }>;
  tool_calls?: any[];
  tool_call_id?: string;
  name?: string;
}

const getSystemPrompt = (language: 'es' | 'en'): string => {
  if (language === 'es') {
    return `
Eres un asistente financiero integral para la aplicación Budget Pro, con capacidades avanzadas de comprensión de lenguaje natural y análisis de datos. Tu misión es ayudar al usuario a gestionar sus finanzas, seguir su presupuesto y ofrecer orientación personalizada basada en sus datos históricos.

🔒 DESCARGOS DE RESPONSABILIDAD Y RESPONSABILIDADES:
- Tus respuestas son educativas y no sustituyen el asesoramiento de un profesional licenciado.
- Para decisiones financieras importantes (inversiones, compras grandes, consolidación de deudas), invita al usuario a consultar a un experto certificado.
- Nunca garantices resultados ni prometas rendimientos futuros; sé transparente sobre tus limitaciones y la calidad de los datos.
- Fomenta la responsabilidad financiera y evita promover comportamientos riesgosos.

🧠 COMPRENSIÓN DE CONTEXTO E IDENTIFICACIÓN DE PALABRAS CLAVE:
1. Detecta la intención y palabras clave del mensaje del usuario (por ejemplo: ingresos, gastos, deudas, inversiones, metas, cálculos, ahorro, borrar, eliminar). Esto te permitirá seleccionar la función o el análisis adecuado.
2. Analiza el contexto temporal: si se mencionan meses específicos, frases como "este mes", "últimos seis meses" o "anual", ajusta tu análisis a ese periodo. Si la información temporal falta, pregunta brevemente para aclararla.
3. Recoge detalles necesarios cuando el usuario solicite acciones concretas (fecha, monto, descripción, categoría) mediante preguntas claras. Usa listas con viñetas para facilitar la comprensión.

📊 ACCESO COMPLETO Y USO DE DATOS FINANCIEROS:

Tienes acceso al historial financiero completo del usuario, que incluye transacciones, ingresos, presupuestos, deudas, inversiones, métricas de salud financiera y resúmenes mensuales/anuales. Debes:
- Identificar patrones de ingresos y gastos a lo largo del tiempo, no solo en el mes actual.
- Calcular promedios, porcentajes y tendencias para ofrecer referencias precisas. Por ejemplo, si el gasto en alimentación representa el 35% de los ingresos mensuales, compáralo con la distribución 50/30/20.
- Referenciar transacciones, categorías o periodos específicos al dar recomendaciones. Cita cifras concretas y explica siempre el "por qué" de cada sugerencia.
- Cuando analices deudas, considera saldos, tasas de interés y pagos para ofrecer estrategias como Bola de Nieve o Avalancha.
- Evalúa la salud financiera y usa sus métricas para personalizar consejos.

🛠️ CAPACIDADES Y FUNCIONES DISPONIBLES:

Selecciona la función adecuada en función de la intención y contexto detectados:
- **getSpendingAnalysis**: Analiza gastos por categoría, identifica excesos y oportunidades de ahorro.
- **getDebtAnalysis**: Genera estrategias de pago (Bola de Nieve, Avalancha, Saldo Mayor) según las deudas del usuario.
- **getFinancialHealthScore**: Obtiene puntuaciones de salud financiera y recomendaciones.
- **getInvestmentAdvice**: Proporciona orientación de inversión acorde al perfil de riesgo y liquidez del usuario.
- **calculateSavingsGoal**: Ayuda a fijar y seguir objetivos de ahorro; compara progreso frente a metas.
- **updateBudget / getDailySpendingLimit**: Optimiza presupuestos y calcula cuánto puede gastar hoy sin sobrepasar su presupuesto.
- **createFinancialGoal / updateFinancialGoal / deleteFinancialGoal**: Gestiona metas financieras (ahorrar para vacaciones, reducir deudas, etc.).
- **requestCategorySelection / requestConfirmation / addTransaction**: Gestiona transacciones siguiendo un flujo en varios pasos.
- **deleteTransaction**: Elimina transacciones específicas cuando el usuario lo solicite explícitamente.
- **generatePersonalizedRecommendations**: Compila recomendaciones amplias para mejorar la salud financiera.

🧾 GESTIÓN DE TRANSACCIONES Y CÁLCULOS:

**Para AGREGAR transacciones:**
1. Recopila la información faltante (fecha, monto, descripción) en formato de lista con viñetas y acepta fechas en lenguaje natural (ej. "ayer", "15 de agosto").
2. Sugiere la categoría adecuada con requestCategorySelection basándote en la descripción.
3. Confirma con el usuario el resumen usando requestConfirmation.
4. Solo tras la confirmación explícita, ejecuta addTransaction.

**Para ELIMINAR transacciones:**
1. Cuando el usuario pida borrar/eliminar una transacción, identifica primero qué transacción específica (por descripción, monto, fecha).
2. Usa getMonthlyTransactions para buscar la transacción exacta.
3. Confirma con el usuario que desea eliminar ESA transacción específica mostrando todos sus detalles.
4. Solo tras confirmación explícita, ejecuta deleteTransaction con el ID de la transacción.
5. Informa al usuario del resultado.

**Para CÁLCULOS:**
- Utiliza los datos históricos relevantes y detalla el método utilizado.
- Muestra porcentajes, totales, promedios de ingresos con explicaciones claras.

💬 COMUNICACIÓN Y MULTILINGÜISMO:
- Responde siempre en ESPAÑOL, que es el idioma configurado del sistema.
- Sé claro, conciso y orientado a la acción. Evita relleno conversacional; usa oraciones cortas y listas con viñetas cuando corresponda.
- Aporta contexto numérico: cifras, porcentajes y comparaciones que apoyen tu análisis.
- Usa emojis con moderación para resaltar secciones (p. ej., 💡 para consejos), sin abusar.
- NUNCA muestres identificadores internos (UUID) ni datos sensibles; solo nombres de categorías o etiquetas comprensibles para el usuario.

🎯 EJEMPLOS DE INTERACCIONES ENRIQUECIDAS:
- "¿Cuánto he ingresado en promedio los últimos seis meses?" → Calcula el promedio mensual de ingresos en ese periodo y compáralo con los seis meses anteriores. Si no se especifica un rango, pregunta.
- "¿Cuál es mi porcentaje de gastos en ocio este mes?" → Usa getSpendingAnalysis para obtener el gasto en ocio y divídelo entre el ingreso total del mes actual; muéstralo como porcentaje y ofrece recomendaciones si supera el 30% de la categoría "Deseos".
- "Necesito saber cuánto puedo gastar mañana para no exceder mi presupuesto." → Emplea getDailySpendingLimit tomando en cuenta el presupuesto restante y los patrones de gasto habituales.
- "Quiero invertir 5,000€ en un fondo de bajo riesgo." → Consulta getInvestmentAdvice y, según su perfil de riesgo y liquidez, presenta varias opciones. Recuerda incluir una nota sobre consultar a un asesor profesional.
- "Ayúdame a calcular cuánto ahorraré si reduzco mis gastos en restaurantes un 10%." → Calcula el ahorro proyectado con base en el gasto actual en restaurantes; ofrece alternativas de distribución del ahorro.
- "Borra la transacción de 50€ en Mercadona del lunes pasado" → Busca la transacción, confirma los detalles con el usuario y elimínala tras su aprobación.
`;
  } else {
    return `
You are a comprehensive financial advisor assistant for Budget Pro, with advanced natural language understanding and data analysis capabilities. Your mission is to help users manage their finances, track their budgets, and provide personalized guidance based on their historical data.

🔒 DISCLAIMERS & RESPONSIBILITIES:
- Your responses are educational and do not substitute advice from a licensed professional.
- For major financial decisions (investments, large purchases, debt consolidation), encourage users to consult a certified expert.
- Never guarantee results or promise future returns; be transparent about your limitations and data quality.
- Promote financial responsibility and avoid encouraging risky behaviors.

🧠 CONTEXT UNDERSTANDING & KEYWORD IDENTIFICATION:
1. Detect intent and keywords from user messages (e.g., income, expenses, debts, investments, goals, calculations, savings, delete, remove). This will help you select the appropriate function or analysis.
2. Analyze temporal context: if specific months, phrases like "this month", "last six months" or "annual" are mentioned, adjust your analysis to that period. If temporal information is missing, ask briefly to clarify.
3. Collect necessary details when users request specific actions (date, amount, description, category) through clear questions. Use bulleted lists for easier understanding.

📊 COMPREHENSIVE FINANCIAL DATA ACCESS AND USAGE:

You have access to the user's complete financial history, including transactions, income, budgets, debts, investments, financial health metrics, and monthly/annual summaries. You must:
- Identify income and expense patterns over time, not just the current month.
- Calculate averages, percentages, and trends to provide accurate references. For example, if food spending represents 35% of monthly income, compare it to the 50/30/20 distribution.
- Reference specific transactions, categories, or time periods when making recommendations. Cite concrete figures and always explain the "why" behind each suggestion.
- When analyzing debts, consider balances, interest rates, and payments to offer strategies like Snowball or Avalanche.
- Evaluate financial health and use its metrics to personalize advice.

🛠️ AVAILABLE CAPABILITIES AND FUNCTIONS:

Select the appropriate function based on detected intent and context:
- **getSpendingAnalysis**: Analyzes expenses by category, identifies excesses and savings opportunities.
- **getDebtAnalysis**: Generates payment strategies (Snowball, Avalanche, Highest Balance) based on user's debts.
- **getFinancialHealthScore**: Gets financial health scores and recommendations.
- **getInvestmentAdvice**: Provides investment guidance appropriate to risk profile and liquidity.
- **calculateSavingsGoal**: Helps set and track savings objectives; compares progress against goals.
- **updateBudget / getDailySpendingLimit**: Optimizes budgets and calculates how much can be spent today without exceeding budget.
- **createFinancialGoal / updateFinancialGoal / deleteFinancialGoal**: Manages financial goals (save for vacation, reduce debts, etc.).
- **requestCategorySelection / requestConfirmation / addTransaction**: Manages transactions following a multi-step flow.
- **deleteTransaction**: Deletes specific transactions when explicitly requested by the user.
- **generatePersonalizedRecommendations**: Compiles comprehensive recommendations to improve financial health.

🧾 TRANSACTION MANAGEMENT AND CALCULATIONS:

**To ADD transactions:**
1. Collect missing information (date, amount, description) in bulleted list format and accept natural language dates (e.g., "yesterday", "August 15th").
2. **IMPORTANT: Determine if it's an INCOME or EXPENSE**
   - **Income (ingresos)**: Money received (salary, freelance, gifts, etc.) - **NO CATEGORY NEEDED**. Skip directly to step 3.
   - **Expense (gastos)**: Money spent - **REQUIRES A CATEGORY**. Use requestCategorySelection to suggest appropriate category based on description.
3. Confirm with user using requestConfirmation showing summary (including category if it's an expense).
4. Only after explicit confirmation, execute addTransaction (with category only if it's an expense).

**To EDIT/UPDATE transactions:**
1. When user asks to edit/modify/update a transaction, first identify which specific transaction (by description, amount, date).
2. Use getMonthlyTransactions to find the exact transaction.
3. Ask user what fields they want to update (amount, description, category, date, etc.).
4. Confirm the changes with user showing old vs new values.
5. Only after explicit confirmation, execute updateTransaction with transaction ID, type, and updates.
6. Inform user of the result.

**To DELETE transactions:**
1. When user asks to delete/remove a transaction, first identify which specific transaction (by description, amount, date).
2. Use getMonthlyTransactions to find the exact transaction.
3. Confirm with user they want to delete THAT specific transaction showing all its details.
4. Only after explicit confirmation, execute deleteTransaction with transaction ID.
5. Inform user of the result.

**For CALCULATIONS:**
- Use relevant historical data and detail the method used.
- Show percentages, totals, income averages with clear explanations.

💬 COMMUNICATION AND MULTILINGUALISM:
- Always respond in ENGLISH, which is the configured system language.
- Be clear, concise, and action-oriented. Avoid conversational filler; use short sentences and bulleted lists when appropriate.
- Provide numerical context: figures, percentages, and comparisons that support your analysis.
- Use emojis sparingly to highlight sections (e.g., 💡 for tips), without overuse.
- NEVER show internal identifiers (UUIDs) or sensitive data; only user-friendly category names or labels.

🎯 ENRICHED INTERACTION EXAMPLES:
- "How much have I earned on average in the last six months?" → Calculate monthly income average for that period and compare to previous six months. If range not specified, ask.
- "What's my entertainment spending percentage this month?" → Use getSpendingAnalysis to get entertainment spending and divide by total monthly income; show as percentage and offer recommendations if it exceeds 30% of "Wants" category.
- "I need to know how much I can spend tomorrow without exceeding my budget." → Use getDailySpendingLimit considering remaining budget and usual spending patterns.
- "I want to invest $5,000 in a low-risk fund." → Check getInvestmentAdvice and based on risk profile and liquidity, present various options. Remember to include note about consulting professional advisor.
- "Help me calculate how much I'll save if I reduce restaurant spending by 10%." → Calculate projected savings based on current restaurant spending; offer alternatives for distributing savings.
- "Delete the $50 transaction at Walmart from last Monday" → Find transaction, confirm details with user, and delete after approval.
`;
  }
}


export class AIService {
  private openai: OpenAI;

  constructor(apiKey?: string) {
    const key = apiKey || DEFAULT_API_KEY;
    this.openai = new OpenAI({
      apiKey: key,
      dangerouslyAllowBrowser: true // Required for client-side usage
    });
  }

  async sendMessage(messages: AIMessage[], context: AIContext, language: 'es' | 'en' = 'es') {
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

    // NEW: Build comprehensive financial data summary if available
    let comprehensiveDataSummary = '';
    if (context.comprehensiveData) {
      const cd = context.comprehensiveData;

      // Helper function to safely format numbers
      const safeFixed = (value: any, decimals: number = 2): string => {
        return value != null && !isNaN(Number(value)) ? Number(value).toFixed(decimals) : '0';
      };

      comprehensiveDataSummary = `
═══════════════════════════════════════════════════════════
📊 COMPREHENSIVE FINANCIAL DATA SUMMARY
═══════════════════════════════════════════════════════════

🏦 ANNUAL SUMMARY:
${cd.annualSummary ? `
  - Annual Income: ${safeFixed(cd.annualSummary.annual_income, 2)} ${context.currency}
  - Annual Expenses: ${safeFixed(cd.annualSummary.annual_expenses, 2)} ${context.currency}
  - Annual Net Cash Flow: ${safeFixed(cd.annualSummary.annual_net_cash_flow, 2)} ${context.currency}
  - Annual Savings Rate: ${safeFixed(cd.annualSummary.annual_savings_rate, 1)}%
  - Annual Total Debt: ${safeFixed(cd.annualSummary.annual_total_debt, 2)} ${context.currency}
` : 'No annual data available'}

💳 FINANCIAL HEALTH SCORE: ${safeFixed(cd.financialHealth.overallHealthScore, 1)}/100
  - Debt Management: ${safeFixed(cd.financialHealth.healthScoreBreakdown.debtManagement, 1)}/100
  - Savings Habits: ${safeFixed(cd.financialHealth.healthScoreBreakdown.savingsHabits, 1)}/100
  - Budget Discipline: ${safeFixed(cd.financialHealth.healthScoreBreakdown.budgetDiscipline, 1)}/100
  - Income Stability: ${safeFixed(cd.financialHealth.healthScoreBreakdown.incomeStability, 1)}/100

💰 KEY METRICS:
  - Debt-to-Income Ratio: ${safeFixed(cd.financialHealth.debtToIncomeRatio, 2)}
  - Total Debt: ${safeFixed(cd.financialHealth.totalDebt, 2)} ${context.currency}
  - Average Monthly Expenses: ${safeFixed(cd.financialHealth.averageMonthlyExpenses, 2)} ${context.currency}
  - Average Monthly Income: ${safeFixed(cd.financialHealth.averageMonthlyIncome, 2)} ${context.currency}
  - Average Monthly Savings: ${safeFixed(cd.financialHealth.averageMonthlySavings, 2)} ${context.currency}
  - Savings Rate: ${safeFixed(cd.financialHealth.savingsRate, 1)}%
  - Expense Trend: ${cd.financialHealth.expenseTrend || 'stable'}

📈 HISTORICAL DATA AVAILABLE:
  - Total Transactions: ${cd.allTransactions.length}
  - Total Income Entries: ${cd.allIncome.length}
  - Total Budget Entries: ${cd.allBudgets.length}
  - Total Debt Entries: ${cd.allDebts.length}
  - Monthly Summaries: ${cd.monthlySummaries.length} months
  - Categories: ${cd.categories.length}
  - Accounts: ${cd.accounts.length}
  - Payment Methods: ${cd.paymentMethods.length}

⚠️ ALERTS:
  ${cd.financialHealth.overBudgetCategories.length > 0 ? `- Over Budget Categories: ${cd.financialHealth.overBudgetCategories.join(', ')}` : ''}
  ${cd.financialHealth.underutilizedCategories.length > 0 ? `- Underutilized Categories: ${cd.financialHealth.underutilizedCategories.join(', ')}` : ''}
  ${cd.financialHealth.highestExpenseCategory ? `- Highest Expense Category: ${cd.financialHealth.highestExpenseCategory.name} (${safeFixed(cd.financialHealth.highestExpenseCategory.amount, 2)} ${context.currency})` : ''}

💡 Use this comprehensive data to provide deeply personalized financial advice!
═══════════════════════════════════════════════════════════
`;
    }

    // Prepare the context message
    const contextMessage = {
      role: 'system',
      content: `Current Financial Context:
      Monthly Income: ${context.monthlyIncome} ${context.currency}
      Current Month: ${context.currentMonth || 'N/A'}
      Current Year: ${context.currentYear || 'N/A'}

      ${budgetSummaryText}

      Available Budget Categories (Use these IDs strictly):
      ${formatCategories(context.budgetCategories)}

      Current Month Transactions (${context.currentMonthTransactions?.length || 0} total):
      ${JSON.stringify(context.currentMonthTransactions || context.transactions.slice(-10))}

      ${comprehensiveDataSummary}
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
      { role: 'system', content: getSystemPrompt(language) },
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
              description: 'Add a new transaction (income or expense) to the budget. IMPORTANT: Income transactions do NOT require a category - only expenses need categories. ONLY call this after the user has explicitly confirmed the details via the requestConfirmation tool.',
              parameters: {
                type: 'object',
                properties: {
                  description: {
                    type: 'string',
                    description: 'Description of the transaction (e.g., "Salary", "Freelance work", "Groceries")'
                  },
                  amount: {
                    type: 'number',
                    description: 'Amount of the transaction'
                  },
                  type: {
                    type: 'string',
                    enum: ['income', 'expense'],
                    description: 'Type of transaction - use "income" for money received, "expense" for money spent'
                  },
                  category: {
                    type: 'string',
                    description: 'Category ID - ONLY required for expenses (type="expense"). Do NOT provide for income (type="income").'
                  },
                  date: {
                    type: 'string',
                    description: 'Date of transaction (YYYY-MM-DD)'
                  }
                },
                required: ['description', 'amount', 'type', 'date']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'requestCategorySelection',
              description: 'Ask the user to select a category from a list. ONLY use this for EXPENSES - income does NOT need a category. Call this when you have the expense amount and description but need the user to select a category.',
              parameters: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    enum: ['expense'],
                    description: 'The type must always be "expense" - this function is only for expenses'
                  },
                  suggestedCategories: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of category IDs that match the expense description (e.g., ["transport", "dining", "groceries"])'
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
              description: 'Ask the user to confirm the transaction details before adding it. For expenses, call this after category selection. For income, call this after collecting amount, description, and date.',
              parameters: {
                type: 'object',
                properties: {
                  summary: {
                    type: 'string',
                    description: 'A summary of the transaction to be added (e.g., "Gasto de 50€ en Alimentación para hoy" for expense, or "Ingreso de 1000€ de Salario para hoy" for income)'
                  },
                  transactionData: {
                    type: 'object',
                    description: 'The full transaction data to be passed back to addTransaction if confirmed. Note: category is only required for expenses.',
                    properties: {
                      description: { type: 'string' },
                      amount: { type: 'number' },
                      type: { type: 'string' },
                      category: {
                        type: 'string',
                        description: 'Category ID - only required if type is "expense". Omit for income.'
                      },
                      date: { type: 'string' }
                    },
                    required: ['description', 'amount', 'type', 'date']
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
          },
          {
            type: 'function',
            function: {
              name: 'getDebtAnalysis',
              description: 'Get comprehensive debt analysis including total debt, individual debt details, and payoff strategies (Snowball, Avalanche, Highest Balance methods) with estimated timelines and interest calculations.',
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
              name: 'getFinancialHealthScore',
              description: 'Get comprehensive financial health metrics including overall score (0-100), debt management score, savings habits score, budget discipline score, income stability score, and personalized recommendations.',
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
              name: 'getInvestmentAdvice',
              description: 'Get personalized investment recommendations based on the user\'s financial situation, risk profile, savings rate, and debt status. Provides general investment strategies for different risk levels.',
              parameters: {
                type: 'object',
                properties: {
                  riskProfile: {
                    type: 'string',
                    enum: ['conservative', 'moderate', 'aggressive'],
                    description: 'The user\'s risk tolerance for investments. Ask the user if not specified.'
                  },
                  investmentHorizon: {
                    type: 'string',
                    enum: ['short', 'medium', 'long'],
                    description: 'Investment time horizon: short (<3 years), medium (3-10 years), long (>10 years)'
                  },
                  monthlyInvestmentAmount: {
                    type: 'number',
                    description: 'Optional: Amount user wants to invest monthly'
                  }
                },
                required: ['riskProfile', 'investmentHorizon']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'calculateSavingsGoal',
              description: 'Calculate how to achieve a savings goal based on target amount, timeline, and current savings rate. Provides monthly savings needed and feasibility assessment.',
              parameters: {
                type: 'object',
                properties: {
                  targetAmount: {
                    type: 'number',
                    description: 'Target savings amount'
                  },
                  timelineMonths: {
                    type: 'number',
                    description: 'Number of months to achieve the goal'
                  },
                  currentSavings: {
                    type: 'number',
                    description: 'Current amount already saved towards this goal (optional)'
                  },
                  purpose: {
                    type: 'string',
                    description: 'Purpose of savings (e.g., "emergency fund", "vacation", "down payment")'
                  }
                },
                required: ['targetAmount', 'timelineMonths', 'purpose']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'getExpenseForecast',
              description: 'Forecast future expenses based on historical spending patterns. Predicts likely expenses for upcoming months and identifies seasonal trends.',
              parameters: {
                type: 'object',
                properties: {
                  forecastMonths: {
                    type: 'number',
                    description: 'Number of months to forecast (default: 3)'
                  },
                  categoryId: {
                    type: 'string',
                    description: 'Optional: specific category to forecast. If omitted, forecasts all expenses.'
                  }
                },
                required: []
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'createFinancialGoal',
              description: 'Create a new financial goal for the user. Goals can be savings targets, debt reduction, expense limits, or income increases. The goal will be tracked in the Financial Health section.',
              parameters: {
                type: 'object',
                properties: {
                  goalType: {
                    type: 'string',
                    enum: ['savings', 'debt_reduction', 'expense_limit', 'income_increase'],
                    description: 'Type of financial goal'
                  },
                  targetAmount: {
                    type: 'number',
                    description: 'Target amount for the goal'
                  },
                  description: {
                    type: 'string',
                    description: 'Clear description of the goal (e.g., "Ahorrar para fondo de emergencia")'
                  },
                  monthId: {
                    type: 'number',
                    description: 'Month ID (1-12) for which this goal applies. Defaults to current month if not specified.'
                  }
                },
                required: ['goalType', 'targetAmount', 'description']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'updateFinancialGoal',
              description: 'Update an existing financial goal progress or details. Use this to mark progress towards goals or modify goal parameters.',
              parameters: {
                type: 'object',
                properties: {
                  goalId: {
                    type: 'string',
                    description: 'The UUID of the goal to update'
                  },
                  updates: {
                    type: 'object',
                    description: 'Fields to update',
                    properties: {
                      currentAmount: {
                        type: 'number',
                        description: 'Current progress amount'
                      },
                      targetAmount: {
                        type: 'number',
                        description: 'New target amount'
                      },
                      description: {
                        type: 'string',
                        description: 'Updated description'
                      },
                      isCompleted: {
                        type: 'boolean',
                        description: 'Mark goal as completed'
                      }
                    }
                  }
                },
                required: ['goalId', 'updates']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'deleteFinancialGoal',
              description: 'Delete a financial goal. Use this when the user no longer wants to track a specific goal.',
              parameters: {
                type: 'object',
                properties: {
                  goalId: {
                    type: 'string',
                    description: 'The UUID of the goal to delete'
                  }
                },
                required: ['goalId']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'getFinancialGoals',
              description: 'Get all financial goals for the user, optionally filtered by month.',
              parameters: {
                type: 'object',
                properties: {
                  monthId: {
                    type: 'number',
                    description: 'Optional: filter goals by specific month (1-12)'
                  }
                },
                required: []
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'updateTransaction',
              description: 'Update an existing transaction (income, expense, debt, or wishlist item). Use this when the user wants to edit or modify a transaction. First use getMonthlyTransactions to find the transaction, then call this function to update it.',
              parameters: {
                type: 'object',
                properties: {
                  transactionId: {
                    type: 'string',
                    description: 'The ID of the transaction to update'
                  },
                  transactionType: {
                    type: 'string',
                    enum: ['income', 'expense', 'debt', 'wishlist'],
                    description: 'The type of transaction being updated'
                  },
                  updates: {
                    type: 'object',
                    description: 'Fields to update. For expenses: description, amount, category, date. For income: description, amount, date (no category). For debts: starting_balance, payment_made, interest_rate_apr, min_payment. For wishlist: item, estimated_cost, priority.',
                    properties: {
                      description: { type: 'string' },
                      amount: { type: 'number' },
                      category: { type: 'string', description: 'Only for expenses' },
                      date: { type: 'string' },
                      starting_balance: { type: 'number', description: 'Only for debts' },
                      payment_made: { type: 'number', description: 'Only for debts' },
                      interest_rate_apr: { type: 'number', description: 'Only for debts' },
                      min_payment: { type: 'number', description: 'Only for debts' },
                      item: { type: 'string', description: 'Only for wishlist' },
                      estimated_cost: { type: 'number', description: 'Only for wishlist' },
                      priority: { type: 'number', description: 'Only for wishlist (1-5)' }
                    }
                  }
                },
                required: ['transactionId', 'transactionType', 'updates']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'generatePersonalizedRecommendations',
              description: 'Generate comprehensive personalized financial recommendations based on the user\'s complete financial profile, health score, spending patterns, and goals. Returns actionable recommendations that can be displayed in the Financial Health Analysis tab.',
              parameters: {
                type: 'object',
                properties: {
                  focusArea: {
                    type: 'string',
                    enum: ['all', 'savings', 'debt', 'budget', 'income'],
                    description: 'Optional: focus recommendations on a specific area. Defaults to "all" for comprehensive recommendations.'
                  }
                },
                required: []
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
