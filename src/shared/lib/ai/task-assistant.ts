const STOPWORDS = new Set([
  'the','and','for','with','from','into','that','this','your','task','build','create','make','page','flow','system','feature','project'
]);

function tokenize(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token && !STOPWORDS.has(token));
}

function pickFocus(title: string, description?: string | null) {
  const combined = `${title} ${description ?? ''}`.toLowerCase();
  const tokens = tokenize(combined);

  const hasAny = (...keywords: string[]) => keywords.some((keyword) => combined.includes(keyword));

  if (hasAny('auth', 'login', 'register', 'signin', 'sign up')) {
    return {
      summary: 'Authentication work with access, validation, and user flow polish.',
      steps: [
        'Map the login and registration flow plus success and error states',
        'Implement validation and backend request handling',
        'Handle loading, failure, and success feedback for the user',
        'Test protected routes and edge cases before release',
      ],
      priority: 'HIGH' as const,
    };
  }

  if (hasAny('dashboard', 'ui', 'layout', 'design', 'navbar', 'board')) {
    return {
      summary: 'Interface work focused on layout structure, clarity, and interaction states.',
      steps: [
        'Define the target screen structure and key interaction states',
        'Implement reusable UI blocks and responsive layout behavior',
        'Connect real data states and empty or loading scenarios',
        'Polish spacing, hover states, and final QA across breakpoints',
      ],
      priority: 'MEDIUM' as const,
    };
  }

  if (hasAny('api', 'endpoint', 'server', 'backend', 'route', 'database', 'prisma')) {
    return {
      summary: 'Backend work around data flow, persistence, and API reliability.',
      steps: [
        'Define the payload contract and validation rules',
        'Implement database changes and server-side business logic',
        'Add error handling plus permission checks for the route',
        'Verify the endpoint with realistic data and failure scenarios',
      ],
      priority: 'HIGH' as const,
    };
  }

  if (hasAny('analytics', 'metrics', 'report', 'summary')) {
    return {
      summary: 'Analytics work aimed at accurate metrics, trends, and readable insights.',
      steps: [
        'Define the metrics and source data needed for the view',
        'Implement aggregation logic and validate counts',
        'Present the results in a readable dashboard block',
        'Cross-check overdue, done, and in-progress values before shipping',
      ],
      priority: 'MEDIUM' as const,
    };
  }

  const topic = tokens.slice(0, 3).join(' ') || title.trim();

  return {
    summary: `Execution plan for ${topic}.`,
    steps: [
      'Clarify the scope, acceptance criteria, and owner expectations',
      'Implement the main workflow and the key success scenario',
      'Handle edge cases, permissions, and failure states',
      'Review, test, and prepare the final delivery update',
    ],
    priority: 'MEDIUM' as const,
  };
}

export function generateTaskDraft(title: string) {
  const focus = pickFocus(title);

  const description = [
    `Goal: ${title.trim()}`,
    '',
    `AI summary: ${focus.summary}`,
    '',
    'Suggested delivery plan:',
    ...focus.steps.map((step) => `- ${step}`),
  ].join('\n');

  return {
    description,
    suggestedPriority: focus.priority,
  };
}

export function generateSubtaskPlan(title: string, description?: string | null) {
  const focus = pickFocus(title, description);
  const subtasks = focus.steps.map((step, index) => ({
    title: step,
    order: index,
  }));

  const insight = `${focus.summary} Generated ${subtasks.length} focused subtasks from the current task context.`;

  return {
    insight,
    subtasks,
  };
}
