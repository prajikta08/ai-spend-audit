export const toolPricing = {
  Cursor: {
    Hobby: 0,
    Pro: 20,
    "Pro+": 60,
    Ultra: 200,
    Teams: 40,
    Enterprise: null,
  },
  "GitHub Copilot": {
    Individual: 10,
    Business: 19,
    Enterprise: null,
  },
  Claude: {
    Free: 0,
    Pro: 20,
    Max: 100,
    Team: 25,
    Enterprise: null,
  },
  ChatGPT: {
    Free: 0,
    Plus: 20,
    Team: 25,
    Enterprise: null,
  },
  Gemini: {
    Free: 0,
    Pro: 20,
    Ultra: 150,
  },
  "Anthropic API": {
    PayAsYouGo: null,
  },
  "OpenAI API": {
    PayAsYouGo: null,
  },
  Windsurf: {
    Free: 0,
    Pro: 15,
    Teams: 35,
  },
} as const;

export type ToolName = keyof typeof toolPricing;
export type PlanMap = (typeof toolPricing)[ToolName];

// Returns the per-seat price for a given tool + plan.
export function getPlanPrice(tool: string, plan: string): number | null {
  const plans = toolPricing[tool as ToolName];
  if (!plans) return null;

  const price = plans[plan as keyof typeof plans];
  return price ?? null;
}

export function getPlansForTool(tool: string): { plan: string; price: number | null }[] {
  const plans = toolPricing[tool as ToolName];
  if (!plans) return [];

  return Object.entries(plans).map(([plan, price]) => ({
    plan,
    price: price ?? null,
  }));
}

export function getCheapestPaidPlan(tool: string): { plan: string; price: number } | null {
  const plans = getPlansForTool(tool);

  const paid = plans
    .filter((p): p is { plan: string; price: number } => p.price !== null && p.price > 0)
    .sort((a, b) => a.price - b.price);

  return paid[0] ?? null;
}