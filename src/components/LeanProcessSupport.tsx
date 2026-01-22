import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, ChartLine, Recycle, Target, TrendUp, Users, Factory } from '@phosphor-icons/react'
import { useState } from 'react'

const leanPrinciples = [
  {
    id: 'value',
    title: 'Define Value',
    icon: Target,
    description: 'Specify value from the customer\'s perspective',
    color: 'bg-blue-500',
    steps: [
      'Identify customer needs and expectations',
      'Define what creates value for the customer',
      'Distinguish value-add from non-value-add activities',
      'Document customer requirements clearly'
    ]
  },
  {
    id: 'value-stream',
    title: 'Map Value Stream',
    icon: ChartLine,
    description: 'Identify all steps in the value stream and eliminate waste',
    color: 'bg-green-500',
    steps: [
      'Document all process steps from start to finish',
      'Identify the 8 wastes (DOWNTIME)',
      'Calculate process cycle times and lead times',
      'Highlight bottlenecks and constraints',
      'Create future state value stream map'
    ]
  },
  {
    id: 'flow',
    title: 'Create Flow',
    icon: TrendUp,
    description: 'Make value-creating steps flow smoothly',
    color: 'bg-purple-500',
    steps: [
      'Eliminate interruptions and handoffs',
      'Balance workload across the process',
      'Implement continuous flow where possible',
      'Reduce batch sizes',
      'Cross-train team members for flexibility'
    ]
  },
  {
    id: 'pull',
    title: 'Establish Pull',
    icon: ArrowRight,
    description: 'Let customers pull value from producers',
    color: 'bg-accent',
    steps: [
      'Implement just-in-time production',
      'Use kanban systems for visual management',
      'Produce only what is needed when needed',
      'Reduce inventory and work-in-progress',
      'Link production directly to customer demand'
    ]
  },
  {
    id: 'perfection',
    title: 'Pursue Perfection',
    icon: Recycle,
    description: 'Continuously improve through kaizen',
    color: 'bg-red-500',
    steps: [
      'Implement continuous improvement culture',
      'Conduct regular kaizen events',
      'Track and measure key performance indicators',
      'Engage all employees in problem-solving',
      'Standardize improvements and best practices'
    ]
  }
]

const eightWastes = [
  { acronym: 'D', name: 'Defects', description: 'Products or services that don\'t meet requirements', icon: '❌' },
  { acronym: 'O', name: 'Overproduction', description: 'Producing more than needed or before needed', icon: '📦' },
  { acronym: 'W', name: 'Waiting', description: 'Idle time between process steps', icon: '⏱️' },
  { acronym: 'N', name: 'Non-utilized Talent', description: 'Not fully utilizing people\'s skills', icon: '🧠' },
  { acronym: 'T', name: 'Transportation', description: 'Unnecessary movement of materials', icon: '🚚' },
  { acronym: 'I', name: 'Inventory', description: 'Excess products or materials not being processed', icon: '📊' },
  { acronym: 'M', name: 'Motion', description: 'Unnecessary movement of people', icon: '🚶' },
  { acronym: 'E', name: 'Extra Processing', description: 'More work than required by customer', icon: '⚙️' }
]

const leanTools = [
  {
    name: '5S Workplace Organization',
    description: 'Sort, Set in Order, Shine, Standardize, Sustain',
    category: 'Organization',
    icon: Factory,
    color: 'bg-blue-500'
  },
  {
    name: 'Kaizen (Continuous Improvement)',
    description: 'Small, incremental improvements by everyone',
    category: 'Improvement',
    icon: TrendUp,
    color: 'bg-green-500'
  },
  {
    name: 'Value Stream Mapping',
    description: 'Visual representation of material and information flow',
    category: 'Analysis',
    icon: ChartLine,
    color: 'bg-purple-500'
  },
  {
    name: 'Standard Work',
    description: 'Documented best practices for performing work',
    category: 'Standardization',
    icon: Target,
    color: 'bg-accent'
  },
  {
    name: 'Just-in-Time (JIT)',
    description: 'Produce only what is needed when needed',
    category: 'Production',
    icon: ArrowRight,
    color: 'bg-orange-500'
  },
  {
    name: 'Kanban',
    description: 'Visual system to manage workflow and inventory',
    category: 'Visual Management',
    icon: ChartLine,
    color: 'bg-pink-500'
  },
  {
    name: 'Poka-Yoke (Error Proofing)',
    description: 'Mechanisms to prevent or detect errors',
    category: 'Quality',
    icon: Target,
    color: 'bg-red-500'
  },
  {
    name: 'Gemba Walks',
    description: 'Go to the actual place to observe and learn',
    category: 'Leadership',
    icon: Users,
    color: 'bg-teal-500'
  }
]

export default function LeanProcessSupport() {
  const [selectedPrinciple, setSelectedPrinciple] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Lean Process Support</h2>
        <p className="text-muted-foreground mt-2">
          Lean methodology tools and templates for operational excellence
        </p>
      </div>

      <Tabs defaultValue="principles" className="w-full">
        <TabsList>
          <TabsTrigger value="principles">5 Lean Principles</TabsTrigger>
          <TabsTrigger value="wastes">8 Wastes (DOWNTIME)</TabsTrigger>
          <TabsTrigger value="tools">Lean Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="principles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>The Five Principles of Lean Thinking</CardTitle>
              <CardDescription>
                Core principles that guide lean transformation and continuous improvement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leanPrinciples.map((principle, index) => {
                  const Icon = principle.icon
                  const isExpanded = selectedPrinciple === principle.id
                  
                  return (
                    <Card 
                      key={principle.id}
                      className={`transition-all hover:shadow-md cursor-pointer ${
                        isExpanded ? 'ring-2 ring-accent' : ''
                      }`}
                      onClick={() => setSelectedPrinciple(isExpanded ? null : principle.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <div className={`${principle.color} p-3 rounded-lg flex-shrink-0`}>
                            <Icon size={28} weight="bold" className="text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="outline" className="font-mono">
                                {index + 1}
                              </Badge>
                              <CardTitle className="text-xl">{principle.title}</CardTitle>
                            </div>
                            <CardDescription className="text-base">
                              {principle.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      {isExpanded && (
                        <CardContent className="pt-0">
                          <div className="pl-16">
                            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                              Implementation Steps
                            </h4>
                            <ul className="space-y-2">
                              {principle.steps.map((step, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                  <span className="text-accent font-bold">{idx + 1}.</span>
                                  <span className="text-foreground">{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wastes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>The 8 Wastes - DOWNTIME</CardTitle>
              <CardDescription>
                Identify and eliminate these eight types of waste in your processes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {eightWastes.map((waste) => (
                  <Card key={waste.acronym} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="text-4xl flex-shrink-0">
                          {waste.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-destructive text-destructive-foreground font-mono text-lg w-10 h-10 flex items-center justify-center">
                              {waste.acronym}
                            </Badge>
                            <CardTitle className="text-lg">{waste.name}</CardTitle>
                          </div>
                          <CardDescription>
                            {waste.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Remember DOWNTIME:</span> Each letter represents a type of waste to identify and eliminate from your processes. Use this framework during value stream mapping and kaizen events.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lean Tools & Techniques</CardTitle>
              <CardDescription>
                Practical tools to implement lean thinking in your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {leanTools.map((tool) => {
                  const Icon = tool.icon
                  return (
                    <Card key={tool.name} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <div className={`${tool.color} p-3 rounded-lg flex-shrink-0`}>
                            <Icon size={24} weight="bold" className="text-white" />
                          </div>
                          <div className="flex-1">
                            <Badge variant="secondary" className="mb-2">
                              {tool.category}
                            </Badge>
                            <CardTitle className="text-base mb-2">{tool.name}</CardTitle>
                            <CardDescription className="text-sm">
                              {tool.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started with Lean</CardTitle>
              <CardDescription>
                Recommended approach to begin your lean transformation journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Start with Education</h4>
                    <p className="text-sm text-muted-foreground">
                      Train leadership and key team members on lean principles and thinking
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Pick a Pilot Process</h4>
                    <p className="text-sm text-muted-foreground">
                      Select a high-impact process to serve as your first lean improvement project
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Map the Current State</h4>
                    <p className="text-sm text-muted-foreground">
                      Create a value stream map to visualize the current process and identify waste
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-accent text-accent-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Run Kaizen Events</h4>
                    <p className="text-sm text-muted-foreground">
                      Conduct focused improvement workshops to implement changes rapidly
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    5
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Standardize & Sustain</h4>
                    <p className="text-sm text-muted-foreground">
                      Document improvements, train team members, and establish ongoing monitoring
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    6
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Expand & Scale</h4>
                    <p className="text-sm text-muted-foreground">
                      Apply learnings to other processes and build a culture of continuous improvement
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
