import type { RoadmapProject } from '@/types'

export const sampleProjects: RoadmapProject[] = [
  {
    id: 'proj-strategyos-1',
    name: 'Strategy Cards - MVP Launch',
    description: 'Build core strategy creation and alignment product with proven frameworks',
    owner: 'Product Team',
    status: 'on-track',
    priority: 'critical',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    progress: 65,
    budget: 850000,
    actualSpend: 520000,
    dependencies: [],
    countermeasures: [
      {
        id: 'cm-strategyos-1',
        issue: 'User testing shows framework selection is confusing for new users',
        action: 'Add guided onboarding flow with framework recommendations based on org type',
        owner: 'UX Team',
        dueDate: '2024-05-15',
        status: 'in-progress',
        createdAt: new Date('2024-04-10').toISOString()
      }
    ],
    objectives: [
      {
        id: 'obj-strategyos-1',
        projectId: 'proj-strategyos-1',
        category: 'breakthrough',
        description: 'Replace spreadsheet-based strategy creation for 100 pilot organizations',
        owner: 'Product Team',
        targetDate: '2024-06-30',
        status: 'on-track',
        metrics: [
          {
            id: 'metric-strategyos-1',
            name: 'Organizations Using Strategy Cards',
            baseline: 0,
            current: 62,
            target: 100,
            unit: ' orgs',
            frequency: 'weekly',
            lastUpdated: new Date().toISOString(),
            trend: 'improving'
          },
          {
            id: 'metric-strategyos-2',
            name: 'User Satisfaction Score (NPS)',
            baseline: 0,
            current: 48,
            target: 60,
            unit: ' pts',
            frequency: 'monthly',
            lastUpdated: new Date().toISOString(),
            trend: 'improving'
          }
        ]
      },
      {
        id: 'obj-strategyos-2',
        projectId: 'proj-strategyos-1',
        category: 'annual',
        description: 'Support 5 strategic frameworks with guided workflows',
        owner: 'Engineering Team',
        targetDate: '2024-05-31',
        status: 'on-track',
        metrics: [
          {
            id: 'metric-strategyos-3',
            name: 'Frameworks Implemented',
            baseline: 0,
            current: 4,
            target: 5,
            unit: ' frameworks',
            frequency: 'monthly',
            lastUpdated: new Date().toISOString(),
            trend: 'improving'
          }
        ]
      },
      {
        id: 'obj-strategyos-3',
        projectId: 'proj-strategyos-1',
        category: 'improvement',
        description: 'Reduce strategy creation time from 40 hours to 8 hours',
        owner: 'Product Team',
        targetDate: '2024-06-30',
        status: 'on-track',
        metrics: [
          {
            id: 'metric-strategyos-4',
            name: 'Avg Time to Complete Strategy Card',
            baseline: 40,
            current: 12,
            target: 8,
            unit: ' hrs',
            frequency: 'weekly',
            lastUpdated: new Date().toISOString(),
            trend: 'improving'
          }
        ]
      }
    ],
    metrics: [
      {
        id: 'metric-strategyos-5',
        name: 'Feature Completion Rate',
        baseline: 0,
        current: 65,
        target: 100,
        unit: '%',
        frequency: 'weekly',
        lastUpdated: new Date().toISOString(),
        trend: 'improving'
      },
      {
        id: 'metric-strategyos-6',
        name: 'Test Coverage',
        baseline: 45,
        current: 82,
        target: 90,
        unit: '%',
        frequency: 'daily',
        lastUpdated: new Date().toISOString(),
        trend: 'improving'
      }
    ]
  },
  {
    id: 'proj-strategyos-2',
    name: 'Workbench - Execution Engine',
    description: 'Build strategy execution, tracking, and governance capabilities with Hoshin Kanri support',
    owner: 'Engineering Lead',
    status: 'on-track',
    priority: 'critical',
    startDate: '2024-03-01',
    endDate: '2024-09-30',
    progress: 38,
    budget: 1250000,
    actualSpend: 385000,
    dependencies: ['proj-strategyos-1'],
    countermeasures: [
      {
        id: 'cm-strategyos-2',
        issue: 'Portfolio-level dashboard queries taking >5s with large datasets',
        action: 'Implement data caching layer and optimize aggregation queries',
        owner: 'Backend Team',
        dueDate: '2024-06-01',
        status: 'in-progress',
        createdAt: new Date('2024-04-15').toISOString()
      },
      {
        id: 'cm-strategyos-3',
        issue: 'OKR integration requires manual data entry, reducing adoption',
        action: 'Build bi-directional sync with top 3 OKR platforms (Lattice, 15Five, Betterworks)',
        owner: 'Integration Team',
        dueDate: '2024-07-31',
        status: 'open',
        createdAt: new Date('2024-04-20').toISOString()
      }
    ],
    objectives: [
      {
        id: 'obj-strategyos-4',
        projectId: 'proj-strategyos-2',
        category: 'breakthrough',
        description: 'Provide single source of truth for strategy execution across 50 organizations',
        owner: 'Engineering Lead',
        targetDate: '2024-09-30',
        status: 'on-track',
        metrics: [
          {
            id: 'metric-strategyos-7',
            name: 'Organizations Using Workbench',
            baseline: 0,
            current: 18,
            target: 50,
            unit: ' orgs',
            frequency: 'weekly',
            lastUpdated: new Date().toISOString(),
            trend: 'improving'
          },
          {
            id: 'metric-strategyos-8',
            name: 'Initiatives Tracked in Platform',
            baseline: 0,
            current: 342,
            target: 1000,
            unit: ' initiatives',
            frequency: 'daily',
            lastUpdated: new Date().toISOString(),
            trend: 'improving'
          }
        ]
      },
      {
        id: 'obj-strategyos-5',
        projectId: 'proj-strategyos-2',
        category: 'annual',
        description: 'Support 4 execution methodologies (SPM, Hoshin Kanri, OKRs, OpEx)',
        owner: 'Product Team',
        targetDate: '2024-08-31',
        status: 'at-risk',
        metrics: [
          {
            id: 'metric-strategyos-9',
            name: 'Methodologies Supported',
            baseline: 0,
            current: 2,
            target: 4,
            unit: ' methods',
            frequency: 'monthly',
            lastUpdated: new Date().toISOString(),
            trend: 'stable'
          }
        ]
      },
      {
        id: 'obj-strategyos-6',
        projectId: 'proj-strategyos-2',
        category: 'improvement',
        description: 'Eliminate 80% of manual reporting work through automation',
        owner: 'Product Team',
        targetDate: '2024-09-30',
        status: 'on-track',
        metrics: [
          {
            id: 'metric-strategyos-10',
            name: 'Manual Reporting Hours Saved',
            baseline: 0,
            current: 55,
            target: 80,
            unit: '%',
            frequency: 'monthly',
            lastUpdated: new Date().toISOString(),
            trend: 'improving'
          }
        ]
      }
    ],
    metrics: [
      {
        id: 'metric-strategyos-11',
        name: 'Workbench Feature Completion',
        baseline: 0,
        current: 38,
        target: 100,
        unit: '%',
        frequency: 'weekly',
        lastUpdated: new Date().toISOString(),
        trend: 'improving'
      },
      {
        id: 'metric-strategyos-12',
        name: 'Real-time Dashboard Performance',
        baseline: 8500,
        current: 1200,
        target: 500,
        unit: 'ms',
        frequency: 'daily',
        lastUpdated: new Date().toISOString(),
        trend: 'improving'
      }
    ]
  },
  {
    id: 'proj-strategyos-3',
    name: 'Enterprise Integration Layer',
    description: 'Build integrations with ERP, CRM, and project management tools for unified data',
    owner: 'Integration Team',
    status: 'on-track',
    priority: 'high',
    startDate: '2024-05-01',
    endDate: '2024-11-30',
    progress: 22,
    budget: 680000,
    actualSpend: 145000,
    dependencies: ['proj-strategyos-2'],
    countermeasures: [],
    objectives: [
      {
        id: 'obj-strategyos-7',
        projectId: 'proj-strategyos-3',
        category: 'annual',
        description: 'Integrate with 10 enterprise systems to eliminate data silos',
        owner: 'Integration Team',
        targetDate: '2024-11-30',
        status: 'on-track',
        metrics: [
          {
            id: 'metric-strategyos-13',
            name: 'Systems Integrated',
            baseline: 0,
            current: 3,
            target: 10,
            unit: ' systems',
            frequency: 'monthly',
            lastUpdated: new Date().toISOString(),
            trend: 'improving'
          }
        ]
      },
      {
        id: 'obj-strategyos-8',
        projectId: 'proj-strategyos-3',
        category: 'improvement',
        description: 'Achieve 99.5% uptime for all integration endpoints',
        owner: 'DevOps Team',
        targetDate: '2024-11-30',
        status: 'on-track',
        metrics: [
          {
            id: 'metric-strategyos-14',
            name: 'Integration Uptime',
            baseline: 96.8,
            current: 98.9,
            target: 99.5,
            unit: '%',
            frequency: 'daily',
            lastUpdated: new Date().toISOString(),
            trend: 'improving'
          }
        ]
      }
    ],
    metrics: [
      {
        id: 'metric-strategyos-15',
        name: 'Integration Development Progress',
        baseline: 0,
        current: 22,
        target: 100,
        unit: '%',
        frequency: 'weekly',
        lastUpdated: new Date().toISOString(),
        trend: 'improving'
      },
      {
        id: 'metric-strategyos-16',
        name: 'Data Sync Accuracy',
        baseline: 92,
        current: 97.5,
        target: 99.9,
        unit: '%',
        frequency: 'daily',
        lastUpdated: new Date().toISOString(),
        trend: 'improving'
      }
    ]
  },
  {
    id: 'proj-strategyos-4',
    name: 'Portfolio Management & Governance',
    description: 'Build portfolio structuring, capacity planning, and governance capabilities',
    owner: 'Product Team',
    status: 'not-started',
    priority: 'high',
    startDate: '2024-07-01',
    endDate: '2024-12-31',
    progress: 0,
    budget: 920000,
    actualSpend: 0,
    dependencies: ['proj-strategyos-2'],
    countermeasures: [],
    objectives: [
      {
        id: 'obj-strategyos-9',
        projectId: 'proj-strategyos-4',
        category: 'breakthrough',
        description: 'Enable portfolio-level prioritization and resource allocation',
        owner: 'Product Team',
        targetDate: '2024-12-31',
        status: 'not-started',
        metrics: [
          {
            id: 'metric-strategyos-17',
            name: 'Portfolios Managed in System',
            baseline: 0,
            current: 0,
            target: 75,
            unit: ' portfolios',
            frequency: 'weekly',
            lastUpdated: new Date().toISOString(),
            trend: 'stable'
          }
        ]
      },
      {
        id: 'obj-strategyos-10',
        projectId: 'proj-strategyos-4',
        category: 'annual',
        description: 'Support 5 portfolio domains (M&A, OpEx, FinTrans, ESG, Innovation)',
        owner: 'Engineering Team',
        targetDate: '2024-11-30',
        status: 'not-started',
        metrics: [
          {
            id: 'metric-strategyos-18',
            name: 'Portfolio Domains Supported',
            baseline: 0,
            current: 0,
            target: 5,
            unit: ' domains',
            frequency: 'monthly',
            lastUpdated: new Date().toISOString(),
            trend: 'stable'
          }
        ]
      }
    ],
    metrics: [
      {
        id: 'metric-strategyos-19',
        name: 'Portfolio Feature Completion',
        baseline: 0,
        current: 0,
        target: 100,
        unit: '%',
        frequency: 'weekly',
        lastUpdated: new Date().toISOString(),
        trend: 'stable'
      }
    ]
  },
  {
    id: 'proj-strategyos-5',
    name: 'Financial Visibility & Tracking',
    description: 'Link strategy execution to financial outcomes and savings realization',
    owner: 'Finance Integration Lead',
    status: 'not-started',
    priority: 'medium',
    startDate: '2024-08-01',
    endDate: '2024-12-31',
    progress: 0,
    budget: 450000,
    actualSpend: 0,
    dependencies: ['proj-strategyos-2', 'proj-strategyos-3'],
    countermeasures: [],
    objectives: [
      {
        id: 'obj-strategyos-11',
        projectId: 'proj-strategyos-5',
        category: 'annual',
        description: 'Provide shared visibility between Operations and Finance teams',
        owner: 'Finance Integration Lead',
        targetDate: '2024-12-31',
        status: 'not-started',
        metrics: [
          {
            id: 'metric-strategyos-20',
            name: 'Finance System Integrations',
            baseline: 0,
            current: 0,
            target: 5,
            unit: ' systems',
            frequency: 'monthly',
            lastUpdated: new Date().toISOString(),
            trend: 'stable'
          }
        ]
      },
      {
        id: 'obj-strategyos-12',
        projectId: 'proj-strategyos-5',
        category: 'improvement',
        description: 'Automate savings tracking and value realization reporting',
        owner: 'Product Team',
        targetDate: '2024-12-31',
        status: 'not-started',
        metrics: [
          {
            id: 'metric-strategyos-21',
            name: 'Automated Financial Reports',
            baseline: 0,
            current: 0,
            target: 8,
            unit: ' reports',
            frequency: 'monthly',
            lastUpdated: new Date().toISOString(),
            trend: 'stable'
          }
        ]
      }
    ],
    metrics: [
      {
        id: 'metric-strategyos-22',
        name: 'Financial Feature Completion',
        baseline: 0,
        current: 0,
        target: 100,
        unit: '%',
        frequency: 'weekly',
        lastUpdated: new Date().toISOString(),
        trend: 'stable'
      }
    ]
  }
]
