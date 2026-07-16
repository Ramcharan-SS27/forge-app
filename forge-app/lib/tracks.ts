export interface Milestone {
  id: string;
  week: number;
  title: string;
  description: string;
  skills: string[];
  dailyTasks: string[];
  resources: { title: string; url: string; type: 'video' | 'docs' | 'project' | 'article' }[];
  checkpoint: string; // What you should be able to do by the end
  project: string;    // Mini project to validate the milestone
}

export interface Track {
  id: string;
  name: string;
  duration: string;
  goal: string;
  description: string;
  milestones: Milestone[];
}

export const FDE_TRACK: Track = {
  id: 'fde-90',
  name: 'The FDE Track',
  duration: '90 days',
  goal: 'Forward Deployment Engineer',
  description: 'From developer to FDE in 90 days. Ship real AI products, speak to enterprise customers, and own outcomes end-to-end.',
  milestones: [
    {
      id: 'm1',
      week: 1,
      title: 'LLM API Fundamentals',
      description: 'Call an LLM. Understand context windows, tokens, system prompts, and conversation management.',
      skills: ['Anthropic SDK', 'System prompts', 'Token management', 'Streaming responses'],
      dailyTasks: [
        'Call the Anthropic API with a basic prompt — print the response',
        'Build a chatbot with conversation history in 50 lines of Python',
        'Experiment: how does changing the system prompt change personality?',
        'Build a streaming response viewer',
        'Read: Anthropic\'s prompt engineering guide end to end',
      ],
      resources: [
        { title: 'Anthropic API Docs', url: 'https://docs.anthropic.com', type: 'docs' },
        { title: 'Prompt Engineering Guide', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview', type: 'docs' },
        { title: 'Python SDK Quickstart', url: 'https://github.com/anthropics/anthropic-sdk-python', type: 'docs' },
      ],
      checkpoint: 'Build a CLI chatbot that maintains context and streams responses.',
      project: 'A command-line chatbot that can take a system prompt as an argument and streams responses.',
    },
    {
      id: 'm2',
      week: 2,
      title: 'Prompt Engineering & Output Control',
      description: 'Make the model do exactly what you need. Structured outputs, few-shot, chain of thought.',
      skills: ['Few-shot prompting', 'Chain-of-thought', 'JSON outputs', 'Tool use basics'],
      dailyTasks: [
        'Force JSON output from a prompt — parse and use it',
        'Build a few-shot classifier for 3 categories of text',
        'Chain two LLM calls: first classify, then respond accordingly',
        'Build a structured data extractor from unstructured text',
        'Mini project: invoice parser that outputs structured JSON',
      ],
      resources: [
        { title: 'Claude Tool Use Docs', url: 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use', type: 'docs' },
        { title: 'Chain of Thought Prompting', url: 'https://www.anthropic.com/research/chain-of-thought', type: 'article' },
      ],
      checkpoint: 'Extract structured data from a PDF invoice using Claude.',
      project: 'Expense report extractor: take a messy email, output clean JSON with line items.',
    },
    {
      id: 'm3',
      week: 3,
      title: 'RAG Pipelines — Foundation',
      description: 'The most important pattern in enterprise AI. Documents in, answers out.',
      skills: ['Vector embeddings', 'Semantic search', 'Chunking strategies', 'pgvector / Pinecone'],
      dailyTasks: [
        'Embed a paragraph — understand what a vector is',
        'Build a similarity search over 100 documents',
        'Chunk a 50-page PDF 3 different ways — compare search quality',
        'Set up pgvector locally and store 1000 embeddings',
        'Build end-to-end: query → retrieve chunks → answer with citations',
      ],
      resources: [
        { title: 'What are Embeddings?', url: 'https://docs.anthropic.com/en/docs/build-with-claude/embeddings', type: 'docs' },
        { title: 'pgvector docs', url: 'https://github.com/pgvector/pgvector', type: 'docs' },
        { title: 'Build a RAG pipeline', url: 'https://github.com/anthropics/anthropic-cookbook/tree/main/third_party/Pinecone', type: 'project' },
      ],
      checkpoint: 'Ask questions over a 100-page document and get accurate, cited answers.',
      project: 'Company FAQ bot: upload 10 internal docs, ask questions, get answers with sources.',
    },
    {
      id: 'm4',
      week: 4,
      title: 'RAG Pipelines — Production',
      description: 'Make RAG actually work. Reranking, hybrid search, eval.',
      skills: ['Reranking', 'Hybrid search', 'Evaluation', 'Hallucination detection'],
      dailyTasks: [
        'Add a reranker to your RAG pipeline from Week 3',
        'Implement hybrid search (keyword + semantic)',
        'Build an eval set: 20 Q&A pairs, measure retrieval accuracy',
        'Add a "did I hallucinate?" check to your pipeline',
        'Benchmark: which chunking strategy gets the best retrieval score?',
      ],
      resources: [
        { title: 'RAG Evaluation Guide', url: 'https://github.com/anthropics/anthropic-cookbook', type: 'project' },
        { title: 'Cohere Reranking', url: 'https://docs.cohere.com/docs/reranking', type: 'docs' },
      ],
      checkpoint: 'Your RAG pipeline has an eval score above 80% on your test set.',
      project: 'Evaluate your Week 3 FAQ bot. Measure, fix, re-measure.',
    },
    {
      id: 'm5',
      week: 5,
      title: 'Full Stack AI App',
      description: 'Build something a human can actually use. Next.js + AI backend.',
      skills: ['Next.js App Router', 'API routes', 'Streaming UI', 'Auth basics'],
      dailyTasks: [
        'Build a Next.js app with an AI chat endpoint',
        'Add streaming so responses appear in real-time',
        'Add auth with Supabase (email login)',
        'Store chat history in Postgres',
        'Ship it to Vercel with environment variables',
      ],
      resources: [
        { title: 'Next.js App Router Docs', url: 'https://nextjs.org/docs', type: 'docs' },
        { title: 'Supabase Auth Guide', url: 'https://supabase.com/docs/guides/auth', type: 'docs' },
        { title: 'Vercel AI SDK', url: 'https://sdk.vercel.ai', type: 'docs' },
      ],
      checkpoint: 'A deployed web app with login, AI chat, and persistent history.',
      project: 'Customer support bot: deployed, authenticated, with conversation history.',
    },
    {
      id: 'm6',
      week: 6,
      title: 'Customer Discovery & Demo Engineering',
      description: 'The FDE skill that isn\'t technical. Finding the real problem. Building the right demo.',
      skills: ['Discovery questioning', 'Problem framing', 'Demo storytelling', 'Objection handling'],
      dailyTasks: [
        'Write 10 open discovery questions for a hypothetical enterprise customer',
        'Run a mock discovery session with a colleague — find the real problem',
        'Build a demo that tells a story (not just features)',
        'Practice: explain your tech stack to a non-technical executive in 2 minutes',
        'Role-play: handle 3 common enterprise objections (security, cost, accuracy)',
      ],
      resources: [
        { title: 'SPIN Selling (discovery framework)', url: 'https://www.amazon.com/SPIN-Selling-Neil-Rackham/dp/0070511136', type: 'article' },
        { title: 'How FDEs work at Palantir', url: 'https://blog.palantir.com', type: 'article' },
      ],
      checkpoint: 'Run a 30-min mock discovery session. Record it. Review it.',
      project: 'Build a demo for a hypothetical customer with a specific problem. Present it.',
    },
    {
      id: 'm7',
      week: 7,
      title: 'System Design for AI',
      description: 'Think beyond the prototype. How does this scale? Where does it fail?',
      skills: ['AI system design', 'Latency vs accuracy tradeoffs', 'Cost optimization', 'Reliability patterns'],
      dailyTasks: [
        'Design a production RAG system for 10,000 users — diagram it',
        'Calculate the cost of your Week 5 app at 1000 users/day',
        'Add caching to an AI endpoint — measure latency improvement',
        'Design a fallback when the AI fails or returns garbage',
        'Write a system design doc for your best project so far',
      ],
      resources: [
        { title: 'Designing AI Systems', url: 'https://eugeneyan.com', type: 'article' },
        { title: 'LLM Cost Calculator', url: 'https://www.anthropic.com/pricing', type: 'docs' },
      ],
      checkpoint: 'A written system design for a production AI feature, with cost estimates.',
      project: 'Take your Week 5 app and write a production readiness doc.',
    },
    {
      id: 'm8',
      week: 8,
      title: 'Ship a Real AI Product',
      description: 'Put everything together. Build something real that solves a real problem.',
      skills: ['Product thinking', 'Scoping', 'Shipping under pressure', 'User feedback'],
      dailyTasks: [
        'Pick a real problem in your company that AI can solve',
        'Scope an MVP: what does it do, what does it NOT do',
        'Build it — 3 days max',
        'Get 3 internal users to try it',
        'Ship v2 based on their feedback',
      ],
      resources: [],
      checkpoint: 'A deployed product that 3+ people are actually using.',
      project: 'YOUR CAPSTONE: A real AI product, live, with real users, solving a real problem.',
    },
  ],
};

export const TRACKS: Track[] = [FDE_TRACK];

export function getTrackMilestone(trackId: string, milestoneId: string): Milestone | null {
  const track = TRACKS.find(t => t.id === trackId);
  return track?.milestones.find(m => m.id === milestoneId) ?? null;
}

export function getWeekMilestone(weekNumber: number): Milestone | null {
  return FDE_TRACK.milestones.find(m => m.week === weekNumber) ?? null;
}
