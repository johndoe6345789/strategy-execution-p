import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, ArrowRight, CheckCircle, Sparkle } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface FrameworkTemplate {
  id: string
  name: string
  description: string
  steps: Step[]
  bestFor: string[]
  estimatedTime: string
}

interface Step {
  title: string
  description: string
  fields: Field[]
  tips: string[]
}

interface Field {
  name: string
  label: string
  type: 'text' | 'textarea' | 'list'
  placeholder: string
  required: boolean
}

const frameworkTemplates: FrameworkTemplate[] = [
  {
    id: 'swot',
    name: 'SWOT Analysis',
    description: 'Analyze your strengths, weaknesses, opportunities, and threats',
    bestFor: ['Market analysis', 'Competitive positioning', 'Strategic assessment'],
    estimatedTime: '15-20 minutes',
    steps: [
      {
        title: 'Strategic Context',
        description: 'Define what you\'re analyzing and why',
        fields: [
          { name: 'title', label: 'Strategy Title', type: 'text', placeholder: 'e.g., 2024 Market Expansion Strategy', required: true },
          { name: 'vision', label: 'Vision Statement', type: 'textarea', placeholder: 'Where do you want to be in 3-5 years?', required: true },
          { name: 'scope', label: 'Scope', type: 'text', placeholder: 'What boundaries define this strategy?', required: false }
        ],
        tips: [
          'Be specific about what you\'re analyzing',
          'Keep your vision aspirational but achievable',
          'Consider your time horizon (1 year? 3 years? 5 years?)'
        ]
      },
      {
        title: 'Strengths',
        description: 'What advantages do you have? What do you do well?',
        fields: [
          { name: 'strengths', label: 'Strengths', type: 'list', placeholder: 'Enter each strength on a new line...', required: true }
        ],
        tips: [
          'Think about resources, capabilities, and competitive advantages',
          'Consider your brand, technology, team, processes',
          'What would customers say you\'re best at?'
        ]
      },
      {
        title: 'Weaknesses',
        description: 'Where can you improve? What holds you back?',
        fields: [
          { name: 'weaknesses', label: 'Weaknesses', type: 'list', placeholder: 'Enter each weakness on a new line...', required: true }
        ],
        tips: [
          'Be honest - this is for internal planning',
          'Think about resource gaps, skill shortages, process inefficiencies',
          'What do competitors do better than you?'
        ]
      },
      {
        title: 'Opportunities',
        description: 'What external factors could you leverage for growth?',
        fields: [
          { name: 'opportunities', label: 'Opportunities', type: 'list', placeholder: 'Enter each opportunity on a new line...', required: true }
        ],
        tips: [
          'Look at market trends, customer needs, technology shifts',
          'Consider partnerships, new markets, product extensions',
          'What changes in your industry create openings?'
        ]
      },
      {
        title: 'Threats',
        description: 'What external challenges could harm your success?',
        fields: [
          { name: 'threats', label: 'Threats', type: 'list', placeholder: 'Enter each threat on a new line...', required: true }
        ],
        tips: [
          'Think about competitors, regulations, economic factors',
          'Consider technological disruption, changing customer preferences',
          'What keeps you up at night?'
        ]
      },
      {
        title: 'Strategic Goals',
        description: 'Based on your SWOT, what will you achieve?',
        fields: [
          { name: 'goals', label: 'Strategic Goals', type: 'list', placeholder: 'Enter each goal on a new line...', required: true },
          { name: 'metrics', label: 'Success Metrics', type: 'list', placeholder: 'How will you measure success? One per line...', required: true }
        ],
        tips: [
          'Goals should leverage strengths and opportunities',
          'Goals should address weaknesses and threats',
          'Make goals specific and measurable'
        ]
      },
      {
        title: 'Assumptions & Risks',
        description: 'What are you betting on? What could go wrong?',
        fields: [
          { name: 'assumptions', label: 'Key Assumptions', type: 'list', placeholder: 'What must be true for this strategy to work?', required: false }
        ],
        tips: [
          'List assumptions about market, customers, resources',
          'Note dependencies on other teams or external factors',
          'Identify early warning signs if assumptions prove wrong'
        ]
      }
    ]
  },
  {
    id: 'porters-five-forces',
    name: 'Porter\'s Five Forces',
    description: 'Analyze competitive forces shaping your industry',
    bestFor: ['Industry analysis', 'Competitive strategy', 'Market entry decisions'],
    estimatedTime: '20-30 minutes',
    steps: [
      {
        title: 'Strategic Context',
        description: 'Define your industry and competitive landscape',
        fields: [
          { name: 'title', label: 'Strategy Title', type: 'text', placeholder: 'e.g., Enterprise SaaS Competitive Strategy', required: true },
          { name: 'vision', label: 'Vision Statement', type: 'textarea', placeholder: 'What position do you want to achieve?', required: true },
          { name: 'industryDef', label: 'Industry Definition', type: 'text', placeholder: 'Define your industry boundaries', required: true }
        ],
        tips: [
          'Be clear about which industry you\'re analyzing',
          'Consider whether you\'re focused on a segment or the whole market'
        ]
      },
      {
        title: 'Competitive Rivalry',
        description: 'How intense is competition among existing players?',
        fields: [
          { name: 'rivalry', label: 'Competitive Dynamics', type: 'list', placeholder: 'Describe competitive intensity and key rivals...', required: true }
        ],
        tips: [
          'Consider number of competitors, growth rate, product differentiation',
          'Think about price wars, marketing battles, innovation races',
          'Assess switching costs and exit barriers'
        ]
      },
      {
        title: 'Threat of New Entrants',
        description: 'How easy is it for new competitors to enter?',
        fields: [
          { name: 'newEntrants', label: 'Entry Barriers & Threats', type: 'list', placeholder: 'List barriers and potential new entrants...', required: true }
        ],
        tips: [
          'Consider capital requirements, economies of scale, brand loyalty',
          'Think about regulatory hurdles, access to distribution',
          'Are there adjacent industries that could enter?'
        ]
      },
      {
        title: 'Bargaining Power of Suppliers',
        description: 'How much power do suppliers have over you?',
        fields: [
          { name: 'suppliers', label: 'Supplier Dynamics', type: 'list', placeholder: 'Key suppliers and their leverage...', required: true }
        ],
        tips: [
          'How many suppliers exist? How concentrated are they?',
          'Can you easily switch suppliers?',
          'Do suppliers have their own brands/channels?'
        ]
      },
      {
        title: 'Bargaining Power of Buyers',
        description: 'How much power do customers have?',
        fields: [
          { name: 'buyers', label: 'Buyer Dynamics', type: 'list', placeholder: 'Customer concentration and power...', required: true }
        ],
        tips: [
          'How price-sensitive are customers?',
          'How much does your product matter to their business?',
          'Can customers easily switch to competitors?'
        ]
      },
      {
        title: 'Threat of Substitutes',
        description: 'What alternatives could replace your product/service?',
        fields: [
          { name: 'substitutes', label: 'Substitute Products', type: 'list', placeholder: 'List potential substitutes and alternatives...', required: true }
        ],
        tips: [
          'Think broadly - substitutes don\'t have to be direct competitors',
          'Consider different ways customers could solve their problem',
          'Assess price-performance trade-offs of alternatives'
        ]
      },
      {
        title: 'Strategic Response',
        description: 'How will you position yourself given these forces?',
        fields: [
          { name: 'goals', label: 'Strategic Goals', type: 'list', placeholder: 'Your strategic responses to competitive forces...', required: true },
          { name: 'metrics', label: 'Success Metrics', type: 'list', placeholder: 'How will you measure competitive position?', required: true }
        ],
        tips: [
          'Focus on forces where you can create advantage',
          'Consider whether to compete head-on or find a niche',
          'Think about how to shift forces in your favor'
        ]
      }
    ]
  },
  {
    id: 'blue-ocean',
    name: 'Blue Ocean Strategy',
    description: 'Create uncontested market space through value innovation',
    bestFor: ['New market creation', 'Differentiation strategy', 'Escaping competition'],
    estimatedTime: '25-35 minutes',
    steps: [
      {
        title: 'Strategic Context',
        description: 'Define your current market and aspirations',
        fields: [
          { name: 'title', label: 'Strategy Title', type: 'text', placeholder: 'e.g., Value Innovation Initiative', required: true },
          { name: 'vision', label: 'Vision Statement', type: 'textarea', placeholder: 'What uncontested market will you create?', required: true },
          { name: 'currentMarket', label: 'Current Market (Red Ocean)', type: 'textarea', placeholder: 'Describe your current competitive battlefield', required: true }
        ],
        tips: [
          'Be honest about the current state of competition',
          'Think about where markets are oversaturated',
          'Consider where you\'re fighting on price alone'
        ]
      },
      {
        title: 'Eliminate',
        description: 'Which factors that the industry takes for granted should be eliminated?',
        fields: [
          { name: 'eliminate', label: 'Factors to Eliminate', type: 'list', placeholder: 'What can you remove that customers don\'t value?', required: true }
        ],
        tips: [
          'Look for factors that add cost but little customer value',
          'Challenge industry assumptions about "must-haves"',
          'Be bold - elimination creates cost advantage'
        ]
      },
      {
        title: 'Reduce',
        description: 'Which factors should be reduced well below industry standard?',
        fields: [
          { name: 'reduce', label: 'Factors to Reduce', type: 'list', placeholder: 'What can you offer less of than competitors?', required: true }
        ],
        tips: [
          'Find areas where industry over-serves customers',
          'Look for complexity that could be simplified',
          'Consider features customers rarely use'
        ]
      },
      {
        title: 'Raise',
        description: 'Which factors should be raised well above industry standard?',
        fields: [
          { name: 'raise', label: 'Factors to Raise', type: 'list', placeholder: 'Where will you significantly exceed competitors?', required: true }
        ],
        tips: [
          'Focus on what customers truly value but don\'t get enough of',
          'Think about eliminating pain points',
          'Consider raising factors that competitors ignore'
        ]
      },
      {
        title: 'Create',
        description: 'Which factors should be created that the industry has never offered?',
        fields: [
          { name: 'create', label: 'Factors to Create', type: 'list', placeholder: 'What new value can you unlock for customers?', required: true }
        ],
        tips: [
          'Look for unmet needs in current solutions',
          'Think about adjacent benefits customers would love',
          'Consider what would make your offering irresistible'
        ]
      },
      {
        title: 'Value Proposition',
        description: 'Articulate your new value proposition',
        fields: [
          { name: 'goals', label: 'Strategic Goals', type: 'list', placeholder: 'What will you achieve with this blue ocean?', required: true },
          { name: 'metrics', label: 'Success Metrics', type: 'list', placeholder: 'How will you track your differentiation?', required: true }
        ],
        tips: [
          'Your goals should reflect both differentiation AND low cost',
          'Think about new customer segments you can reach',
          'Consider metrics that show you\'re creating new demand'
        ]
      },
      {
        title: 'Implementation Risks',
        description: 'What assumptions are you making?',
        fields: [
          { name: 'assumptions', label: 'Key Assumptions', type: 'list', placeholder: 'What must be true for this to work?', required: true }
        ],
        tips: [
          'Test assumptions about what customers truly value',
          'Consider whether you can deliver at the right price point',
          'Think about how long before competitors copy you'
        ]
      }
    ]
  }
]

interface StrategyFrameworkWizardProps {
  onComplete: (data: any) => void
  onCancel: () => void
}

export default function StrategyFrameworkWizard({ onComplete, onCancel }: StrategyFrameworkWizardProps) {
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, any>>({})

  const framework = frameworkTemplates.find(f => f.id === selectedFramework)
  const progress = framework ? ((currentStep + 1) / (framework.steps.length + 1)) * 100 : 0

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }))
  }

  const validateCurrentStep = () => {
    if (!framework) return false
    const step = framework.steps[currentStep]
    
    for (const field of step.fields) {
      if (field.required) {
        const value = formData[field.name]
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          toast.error(`${field.label} is required`)
          return false
        }
      }
    }
    return true
  }

  const handleNext = () => {
    if (!validateCurrentStep()) return
    
    if (framework && currentStep < framework.steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    } else {
      setSelectedFramework(null)
      setFormData({})
    }
  }

  const handleComplete = () => {
    const strategyData = {
      framework: selectedFramework,
      frameworkName: framework?.name,
      ...formData,
      goals: formData.goals?.split('\n').filter((g: string) => g.trim()) || [],
      metrics: formData.metrics?.split('\n').filter((m: string) => m.trim()) || [],
      assumptions: formData.assumptions?.split('\n').filter((a: string) => a.trim()) || []
    }
    onComplete(strategyData)
    toast.success('Strategy Card created successfully!')
  }

  if (!selectedFramework) {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Choose a Strategic Framework</h2>
          <p className="text-muted-foreground">
            Select a proven framework to guide your strategic planning process
          </p>
        </div>

        <div className="grid gap-4">
          {frameworkTemplates.map((template) => (
            <Card 
              key={template.id}
              className="cursor-pointer hover:border-accent transition-all hover:shadow-md"
              onClick={() => setSelectedFramework(template.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 flex items-center gap-2">
                      <Sparkle size={20} weight="fill" className="text-accent" />
                      {template.name}
                    </CardTitle>
                    <CardDescription className="text-sm">{template.description}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {template.estimatedTime}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Best For:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {template.bestFor.map((item, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{template.steps.length} guided steps</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  if (!framework) return null

  const step = framework.steps[currentStep]

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{framework.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Step {currentStep + 1} of {framework.steps.length}: {step.title}
            </p>
          </div>
          <Badge variant="secondary" className="font-mono">
            {Math.round(progress)}% Complete
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Separator />

      <div className="space-y-6">
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
          <p className="text-sm font-medium mb-2">{step.description}</p>
          {step.tips.length > 0 && (
            <div className="space-y-1 mt-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tips:
              </p>
              <ul className="space-y-1">
                {step.tips.map((tip, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {step.fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name} className="flex items-center gap-2">
                {field.label}
                {field.required && <span className="text-destructive">*</span>}
              </Label>
              
              {field.type === 'text' && (
                <Input
                  id={field.name}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="font-medium"
                />
              )}
              
              {field.type === 'textarea' && (
                <Textarea
                  id={field.name}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  rows={4}
                  className="font-medium"
                />
              )}
              
              {field.type === 'list' && (
                <Textarea
                  id={field.name}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  rows={6}
                  className="font-medium font-mono text-sm"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={handleBack}
          className="gap-2"
        >
          <ArrowLeft size={16} weight="bold" />
          {currentStep === 0 ? 'Change Framework' : 'Previous'}
        </Button>
        
        <Button
          onClick={handleNext}
          className="gap-2 bg-accent hover:bg-accent/90"
        >
          {currentStep === framework.steps.length - 1 ? (
            <>
              <CheckCircle size={16} weight="bold" />
              Complete Strategy
            </>
          ) : (
            <>
              Next Step
              <ArrowRight size={16} weight="bold" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
