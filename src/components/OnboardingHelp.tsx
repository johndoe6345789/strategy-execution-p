import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Question, CheckCircle, Play, Book, Lightbulb, RocketLaunch, Target, Users, ChartBar, MapTrifold } from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'

interface OnboardingStep {
  id: string
  title: string
  description: string
  module: string
  completed: boolean
}

interface Tutorial {
  id: string
  title: string
  description: string
  category: string
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  steps: string[]
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'step-1',
    title: 'Create Your First Strategy Card',
    description: 'Define your strategic vision, goals, and success metrics',
    module: 'Strategy Cards',
    completed: false
  },
  {
    id: 'step-2',
    title: 'Add Initiatives to Execute Strategy',
    description: 'Break down strategy into actionable initiatives in the Workbench',
    module: 'Workbench',
    completed: false
  },
  {
    id: 'step-3',
    title: 'Organize Initiatives into Portfolios',
    description: 'Group related initiatives by strategic theme or business unit',
    module: 'Portfolios',
    completed: false
  },
  {
    id: 'step-4',
    title: 'Track Progress with KPIs',
    description: 'Set up key performance indicators to measure success',
    module: 'KPI Dashboard',
    completed: false
  },
  {
    id: 'step-5',
    title: 'Review Executive Dashboard',
    description: 'Get a bird\'s eye view of strategic performance',
    module: 'Executive Dashboard',
    completed: false
  }
]

const tutorials: Tutorial[] = [
  {
    id: 'tut-1',
    title: 'Getting Started with StrategyOS',
    description: 'Learn the fundamentals of strategic planning and execution',
    category: 'Basics',
    duration: '10 min',
    difficulty: 'beginner',
    steps: [
      'Understand the StrategyOS workflow',
      'Navigate the main dashboard',
      'Access different modules',
      'Customize your workspace',
      'Set user preferences'
    ]
  },
  {
    id: 'tut-2',
    title: 'Creating Effective Strategy Cards',
    description: 'Build comprehensive strategy cards using proven frameworks',
    category: 'Planning',
    duration: '15 min',
    difficulty: 'beginner',
    steps: [
      'Define your strategic vision',
      'Set measurable goals',
      'Choose appropriate frameworks (SWOT, Porter\'s Five Forces)',
      'Document assumptions and risks',
      'Add success metrics'
    ]
  },
  {
    id: 'tut-3',
    title: 'Strategy-to-Execution Translation',
    description: 'Convert strategic objectives into actionable initiatives',
    category: 'Execution',
    duration: '12 min',
    difficulty: 'intermediate',
    steps: [
      'Review strategy cards',
      'Use AI-powered initiative suggestions',
      'Define initiative scope and objectives',
      'Assign owners and resources',
      'Link initiatives to strategies'
    ]
  },
  {
    id: 'tut-4',
    title: 'Portfolio Management Best Practices',
    description: 'Optimize resource allocation across strategic portfolios',
    category: 'Portfolio',
    duration: '18 min',
    difficulty: 'intermediate',
    steps: [
      'Create strategic portfolios',
      'Assess portfolio alignment',
      'Balance capacity and demand',
      'Manage dependencies',
      'Make governance decisions'
    ]
  },
  {
    id: 'tut-5',
    title: 'Advanced Reporting and Analytics',
    description: 'Build custom scorecards and generate automated reports',
    category: 'Reporting',
    duration: '20 min',
    difficulty: 'advanced',
    steps: [
      'Design custom scorecards',
      'Configure drill-down reporting',
      'Set up automated report generation',
      'Track financial outcomes',
      'Build executive dashboards'
    ]
  },
  {
    id: 'tut-6',
    title: 'Hoshin Kanri Implementation',
    description: 'Deploy full Hoshin Kanri methodology for strategic alignment',
    category: 'Hoshin',
    duration: '25 min',
    difficulty: 'advanced',
    steps: [
      'Create X-Matrix for alignment',
      'Set breakthrough objectives',
      'Define annual goals',
      'Track progress with Bowling Chart',
      'Implement PDCA cycles'
    ]
  }
]

const faqs = [
  {
    question: 'What is the difference between Strategy Cards and Initiatives?',
    answer: 'Strategy Cards define high-level strategic direction (vision, goals, frameworks), while Initiatives are the specific projects and actions that execute that strategy. Think of Strategy Cards as the "what and why" and Initiatives as the "how".'
  },
  {
    question: 'How do I link Initiatives to Strategy Cards?',
    answer: 'When creating an Initiative in the Workbench, use the "Linked Strategy" dropdown to select the relevant Strategy Card. You can also use the Strategy-to-Initiative module for AI-powered suggestions.'
  },
  {
    question: 'What is the X-Matrix and when should I use it?',
    answer: 'The X-Matrix is a Hoshin Kanri tool that visually aligns breakthrough objectives, annual goals, metrics, and improvement actions. Use it when you need strategic alignment across multiple organizational levels or time horizons.'
  },
  {
    question: 'Can I export my data from StrategyOS?',
    answer: 'Yes! Use the Automated Report Generation module to export data in HTML or CSV formats. You can also use the API & Webhooks module for programmatic data access.'
  },
  {
    question: 'How do Portfolios help organize my initiatives?',
    answer: 'Portfolios group related initiatives by strategic theme (e.g., Operational Excellence, M&A, ESG). This enables portfolio-level analysis, resource allocation, and governance decisions across related work.'
  },
  {
    question: 'What is the difference between OKRs and KPIs?',
    answer: 'OKRs (Objectives and Key Results) are time-bound goals with specific measurable outcomes, typically quarterly or annual. KPIs (Key Performance Indicators) are ongoing metrics that track operational or strategic performance continuously.'
  },
  {
    question: 'How does traceability work?',
    answer: 'The Traceability module shows the complete line of sight from Strategy Cards down to linked Initiatives, identifying orphaned initiatives and ensuring strategic alignment across your entire portfolio.'
  },
  {
    question: 'Can I customize the scorecards and dashboards?',
    answer: 'Absolutely! Use the Custom Scorecards module to create configurable scorecards with your own metrics, categories, and weights. The Executive Dashboard automatically aggregates data from all your strategic sources.'
  }
]

const quickTips = [
  {
    icon: Target,
    title: 'Use Framework Templates',
    tip: 'Start with proven frameworks like SWOT or Porter\'s Five Forces in the Guided Strategy Creation wizard'
  },
  {
    icon: Users,
    title: 'Assign Clear Ownership',
    tip: 'Every initiative should have a designated owner for accountability and progress tracking'
  },
  {
    icon: ChartBar,
    title: 'Define Measurable KPIs',
    tip: 'Use specific, quantifiable metrics rather than vague goals to track real progress'
  },
  {
    icon: MapTrifold,
    title: 'Link Initiatives to Strategy',
    tip: 'Always connect initiatives to their parent strategy cards to maintain strategic alignment'
  }
]

export default function OnboardingHelp() {
  const [completedSteps, setCompletedSteps] = useKV<string[]>('onboarding-completed-steps', [])
  const [showWelcome, setShowWelcome] = useKV<boolean>('show-welcome-dialog', true)
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null)

  const toggleStep = (stepId: string) => {
    setCompletedSteps((current) => {
      const steps = current || []
      if (steps.includes(stepId)) {
        return steps.filter(id => id !== stepId)
      }
      return [...steps, stepId]
    })
  }

  const resetOnboarding = () => {
    setCompletedSteps([])
    toast.success('Onboarding progress reset')
  }

  const dismissWelcome = () => {
    setShowWelcome(false)
  }

  const completedCount = (completedSteps || []).length
  const totalSteps = onboardingSteps.length
  const progress = Math.round((completedCount / totalSteps) * 100)

  return (
    <div className="space-y-6">
      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-accent/20">
                <RocketLaunch size={32} weight="duotone" className="text-accent" />
              </div>
              <div>
                <DialogTitle className="text-2xl">Welcome to StrategyOS!</DialogTitle>
                <DialogDescription>
                  Your complete platform for strategic planning and execution
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm">
              StrategyOS helps you create, execute, and track strategic initiatives from vision to results. 
              Whether you're using SWOT analysis, Hoshin Kanri, OKRs, or custom frameworks, we've got you covered.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Target size={24} className="text-accent" />
                    <div>
                      <h4 className="font-semibold text-sm">Strategy Planning</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Create strategy cards with proven frameworks
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <ChartBar size={24} className="text-accent" />
                    <div>
                      <h4 className="font-semibold text-sm">Execution Tracking</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Monitor initiatives with real-time progress
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <p className="text-sm text-muted-foreground">
              Complete the quick onboarding steps to get started, or dive right in and explore on your own!
            </p>
          </div>
          <DialogFooter>
            <Button onClick={dismissWelcome}>
              Get Started
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Getting Started & Help</h2>
          <p className="text-muted-foreground mt-2">
            Tutorials, guides, and resources to help you master StrategyOS
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowWelcome(true)}>
          <Play size={16} weight="bold" className="mr-2" />
          Show Welcome
        </Button>
      </div>

      <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <RocketLaunch size={24} weight="duotone" className="text-accent" />
                Quick Start Onboarding
              </CardTitle>
              <CardDescription>
                Complete these steps to get up and running
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-accent">{progress}%</div>
              <div className="text-xs text-muted-foreground">{completedCount} of {totalSteps} complete</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {onboardingSteps.map((step, idx) => {
            const isCompleted = (completedSteps || []).includes(step.id)
            return (
              <Card key={step.id} className={isCompleted ? 'bg-muted/50' : 'bg-card'}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      isCompleted ? 'bg-green-100 text-green-700' : 'bg-accent/20 text-accent'
                    }`}>
                      {isCompleted ? <CheckCircle size={20} weight="fill" /> : idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className={`font-semibold ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                            {step.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {step.module}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant={isCompleted ? "outline" : "default"}
                          onClick={() => toggleStep(step.id)}
                        >
                          {isCompleted ? 'Undo' : 'Complete'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          <div className="flex justify-end pt-2">
            <Button variant="ghost" size="sm" onClick={resetOnboarding}>
              Reset Progress
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tutorials" className="w-full">
        <TabsList>
          <TabsTrigger value="tutorials">Video Tutorials</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="tips">Quick Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="tutorials" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tutorials.map((tutorial) => (
              <Card key={tutorial.id} className="cursor-pointer hover:border-accent transition-colors" onClick={() => setSelectedTutorial(tutorial)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                      <CardDescription className="mt-2">{tutorial.description}</CardDescription>
                    </div>
                    <Play size={32} weight="fill" className="text-accent flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">{tutorial.category}</Badge>
                    <Badge variant="outline">{tutorial.duration}</Badge>
                    <Badge 
                      variant={
                        tutorial.difficulty === 'beginner' ? 'default' : 
                        tutorial.difficulty === 'intermediate' ? 'secondary' : 
                        'outline'
                      }
                    >
                      {tutorial.difficulty}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Dialog open={selectedTutorial !== null} onOpenChange={() => setSelectedTutorial(null)}>
            <DialogContent className="sm:max-w-[600px]">
              {selectedTutorial && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Play size={24} weight="fill" className="text-accent" />
                      {selectedTutorial.title}
                    </DialogTitle>
                    <DialogDescription>{selectedTutorial.description}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{selectedTutorial.category}</Badge>
                      <Badge variant="outline">{selectedTutorial.duration}</Badge>
                      <Badge>{selectedTutorial.difficulty}</Badge>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">What you'll learn:</h4>
                      <ul className="space-y-2">
                        {selectedTutorial.steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle size={16} weight="fill" className="text-accent mt-0.5 flex-shrink-0" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Play size={64} weight="fill" className="text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Tutorial video would play here</p>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => setSelectedTutorial(null)}>Close</Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="faq" className="space-y-3 mt-6">
          {faqs.map((faq, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-base flex items-start gap-2">
                  <Question size={20} weight="bold" className="text-accent mt-0.5 flex-shrink-0" />
                  {faq.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="tips" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickTips.map((tip, idx) => {
              const Icon = tip.icon
              return (
                <Card key={idx}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-accent/10">
                        <Icon size={24} weight="duotone" className="text-accent" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{tip.title}</h4>
                        <p className="text-sm text-muted-foreground">{tip.tip}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Lightbulb size={24} weight="duotone" className="text-blue-600" />
                Pro Tip: Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-blue-900">
              <p>• <strong>Start Small:</strong> Begin with 3-5 key strategies rather than trying to plan everything at once</p>
              <p>• <strong>Review Regularly:</strong> Schedule weekly check-ins on initiative progress and monthly strategy reviews</p>
              <p>• <strong>Align Teams:</strong> Use the Collaborative Workshops module to ensure stakeholder buy-in</p>
              <p>• <strong>Track What Matters:</strong> Focus on leading indicators (predictive) not just lagging indicators (historical)</p>
              <p>• <strong>Be Flexible:</strong> Use PDCA cycles to continuously improve and adapt your strategy based on results</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book size={24} weight="duotone" className="text-accent" />
            Additional Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Book size={24} />
              <span className="text-sm font-semibold">Documentation</span>
              <span className="text-xs text-muted-foreground">Full user guide</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Users size={24} />
              <span className="text-sm font-semibold">Community</span>
              <span className="text-xs text-muted-foreground">Join discussions</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Question size={24} />
              <span className="text-sm font-semibold">Support</span>
              <span className="text-xs text-muted-foreground">Contact us</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
