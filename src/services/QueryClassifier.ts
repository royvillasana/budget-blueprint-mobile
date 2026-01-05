export type QueryComplexity = 'simple' | 'complex';

export function classifyQuery(userMessage: string): QueryComplexity {
  const simplePatterns = [
    /^(hola|hi|hello|buenos días|buenas tardes|buenas noches)/i,
    /cuánto (gasté|gaste|he gastado|gastamos)/i,
    /mi presupuesto/i,
    /mis ingresos/i,
    /total de gastos/i,
    /lista de transacciones/i,
    /^(cuánto|cuanto|how much)/i,
    /mis categorías/i,
    /balance/i,
  ];

  const complexPatterns = [
    /(analiza|analizar|análisis|analyze)/i,
    /(recomienda|recomendación|sugerencia|recommend)/i,
    /(optimiza|optimizar|mejorar|optimize)/i,
    /(compara|comparar|comparación|compare)/i,
    /(predice|predicción|proyecta|predict)/i,
    /(por qué|porque|razón|why)/i,
    /(cómo puedo|como puedo|how can|how do)/i,
    /(estrategia|plan|planifica)/i,
  ];

  // Check for simple patterns first
  if (simplePatterns.some(pattern => pattern.test(userMessage))) {
    return 'simple';
  }

  // Check for complex patterns
  if (complexPatterns.some(pattern => pattern.test(userMessage))) {
    return 'complex';
  }

  // If query is short and no complex words, it's simple
  if (userMessage.length < 50 && !/\?/.test(userMessage)) {
    return 'simple';
  }

  // Default to complex for safety
  return 'complex';
}

export function getModelForComplexity(complexity: QueryComplexity): string {
  return complexity === 'simple' ? 'gpt-4o-mini' : 'gpt-4o';
}

export function getToolsForComplexity(complexity: QueryComplexity, availableTools: any[]) {
  // Simple queries only need basic tools
  const simpleToolNames = [
    'getMonthlyBudget',
    'getTransactionsByMonth',
    'getMonthlyIncome',
    'getCurrentMonthStats',
  ];

  // Complex queries get all tools
  if (complexity === 'complex') {
    return availableTools;
  }

  // Filter to only simple tools
  return availableTools.filter(tool =>
    simpleToolNames.includes(tool.function.name)
  );
}
