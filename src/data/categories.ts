import { Category } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'agile',
    name: 'Agile & Scrum',
    description: 'Sprint planning, standups, and retrospectives',
    icon: '🏃',
    words: [
      'sprint', 'backlog', 'standup', 'retrospective', 'velocity',
      'blocker', 'story points', 'epic', 'user story', 'scrum master',
      'product owner', 'kanban', 'burndown', 'refinement', 'iteration',
      'acceptance criteria', 'definition of done', 'capacity', 'throughput',
      'cycle time', 'lead time', 'swimlane', 'ceremony', 'timeboxed',
      'increment', 'artifact', 'transparency', 'inspection', 'adaptation',
      'self-organizing', 'cross-functional', 'servant leader', 'impediment',
      'spike', 'technical debt', 'refactor', 'MVP', 'release', 'deployment',
      'continuous integration', 'CI/CD', 'demo', 'stakeholder', 'prioritize',
      'scope creep', 'sprint goal', 'daily scrum', 'planning poker'
    ],
  },
  {
    id: 'corporate',
    name: 'Corporate Speak',
    description: 'Synergy, leverage, and circling back',
    icon: '💼',
    words: [
      'synergy', 'leverage', 'circle back', 'take offline', 'bandwidth',
      'low-hanging fruit', 'move the needle', 'deep dive', 'touch base',
      'action item', 'deliverable', 'stakeholder', 'alignment', 'visibility',
      'paradigm shift', 'best practice', 'value proposition', 'ROI',
      'bottom line', 'top of mind', 'streamline', 'optimize', 'scalable',
      'proactive', 'holistic', 'robust', 'ecosystem', 'pivot', 'disruption',
      'innovation', 'thought leader', 'core competency', 'mission critical',
      'game changer', 'win-win', 'net-net', 'helicopter view', 'granular',
      'drill down', 'boil the ocean', 'bleeding edge', 'north star',
      'parking lot', 'table this', 'unpack', 'double-click', 'socialize'
    ],
  },
  {
    id: 'tech',
    name: 'Tech & Engineering',
    description: 'APIs, cloud, and architecture discussions',
    icon: '💻',
    words: [
      'API', 'cloud', 'microservices', 'serverless', 'containerized',
      'kubernetes', 'docker', 'CI/CD', 'pipeline', 'deployment',
      'scalability', 'latency', 'throughput', 'database', 'schema',
      'migration', 'refactor', 'technical debt', 'architecture',
      'infrastructure', 'DevOps', 'observability', 'monitoring',
      'alerting', 'incident', 'postmortem', 'SLA', 'uptime',
      'performance', 'optimization', 'caching', 'load balancing',
      'security', 'authentication', 'authorization', 'encryption',
      'compliance', 'audit', 'code review', 'pull request', 'merge',
      'branch', 'release', 'rollback', 'feature flag', 'A/B test'
    ],
  },
  {
    id: 'pm-bingo',
    name: 'Wesingo',
    description: 'The construction-sales-snowcone PM from Austin',
    icon: '🤠',
    words: [
      // Puns & Humor
      'Bad Pun #1', 'Bad Pun #2', 'Bad Pun #3', 'Groan-Worthy Pun',
      'Pun That Actually Lands', 'Dad Joke', 'Eye Roll Moment',
      // Texas/Austin
      'Mentions Austin', 'Mentions Texas', 'Says Y\'all', 'BBQ Reference',
      'Texas Weather Complaint', 'Austin Traffic', 'Tex-Mex Mention',
      'Texas Pride Moment', 'Compares to Texas',
      // Construction Background
      'Construction Story', 'When I Was in Construction',
      'Building Analogy', 'Site Visit Mention', 'Blueprint Reference',
      'Foundation Metaphor', 'Breaking Ground Reference',
      // Sales Background
      'Sales Days Story', 'Back in Sales...', 'Closing Deals Analogy',
      'Sales Pipeline Mention', 'Quota Reference',
      // Snowcone Stand
      'Snowcone Stand Story', 'Entrepreneurship Moment',
      'Summer Business Tale', 'Side Hustle Reference',
      // Current Work (PM, Integrations, Indoor Positioning)
      'Integration Challenge', 'Indoor Positioning Talk', 'Beacon Mention',
      'Location Accuracy Issue', 'API Discussion', 'Partner Integration',
      'As a PM...', 'Roadmap Discussion', 'Stakeholder Management',
      'Feature Request', 'User Story Time', 'Sprint Planning',
      // Misc Meeting Moments
      'Running Late', 'Technical Difficulties', 'Let Me Share My Screen',
      'Great Question', 'Action Item Assigned'
    ],
  },
];
