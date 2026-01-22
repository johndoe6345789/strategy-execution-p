import { useKV } from '@github/spark/hooks'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, CheckCircle, Sparkle, Target, TrendUp, Users, MapTrifold } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { StrategyCard } from '../types'

const frameworks = [
  {
    id: 'swot',
    name: 'SWOT Analysis',
    description: 'Analyze Strengths, Weaknesses, Opportunities, and Threats',
    icon: Target,
    color: 'bg-blue-500'
  },
  {
    id: 'porters',
    name: "Porter's Five Forces",
    description: 'Competitive analysis framework for industry assessment',
    icon: TrendUp,
    color: 'bg-purple-500'
  },
  {
    id: 'blue-ocean',
    name: 'Blue Ocean Strategy',
    description: 'Create uncontested market space through value innovation',
    icon: MapTrifold,
    color: 'bg-cyan-500'
  },
  {
    id: 'custom',
    name: 'Custom Strategy',
    description: 'Create your own strategic framework from scratch',
    icon: Sparkle,
    color: 'bg-accent'
  }
]

interface WizardData {
  framework: string
  name: string
  description: string
  vision: string
  goals: string[]
  metrics: string[]
  swot?: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
  }
  porters?: {
    competitiveRivalry: string
    supplierPower: string
    buyerPower: string
    threatOfSubstitution: string
    threatOfNewEntry: string
  }
  blueOcean?: {
    eliminate: string[]
    reduce: string[]
    raise: string[]
    create: string[]
  }
}

export default function StrategyFrameworkWizard() {
  const [strategyCards, setStrategyCards] = useKV<StrategyCard[]>('strategy-cards', [])
  const [currentStep, setCurrentStep] = useState(0)
  const [wizardData, setWizardData] = useState<WizardData>({
    framework: '',
    name: '',
    description: '',
    vision: '',
    goals: ['', '', ''],
    metrics: ['', '', ''],
    swot: {
      strengths: ['', ''],
      weaknesses: ['', ''],
      opportunities: ['', ''],
      threats: ['', '']
    },
    porters: {
      competitiveRivalry: '',
      supplierPower: '',
      buyerPower: '',
      threatOfSubstitution: '',
      threatOfNewEntry: ''
    },
    blueOcean: {
      eliminate: ['', ''],
      reduce: ['', ''],
      raise: ['', ''],
      create: ['', '']
    }
  })

  const steps = [
    { title: 'Select Framework', description: 'Choose your strategic approach' },
    { title: 'Basic Info', description: 'Name and describe your strategy' },
    { title: 'Vision & Goals', description: 'Define your strategic direction' },
    { title: 'Framework Details', description: 'Complete framework-specific analysis' },
    { title: 'Metrics', description: 'Define success measurements' },
    { title: 'Review', description: 'Review and create strategy' }
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  const addArrayItem = (field: keyof WizardData, subField?: string) => {
    if (subField && field in wizardData) {
      const obj = wizardData[field] as any
      setWizardData({
        ...wizardData,
        [field]: {
          ...obj,
          [subField]: [...obj[subField], '']
        }
      })
    } else {
      setWizardData({
        ...wizardData,
        [field]: [...(wizardData[field] as string[]), '']
      })
    }
  }

  const updateArrayItem = (field: keyof WizardData, index: number, value: string, subField?: string) => {
    if (subField && field in wizardData) {
      const obj = wizardData[field] as any
      const updated = [...obj[subField]]
      updated[index] = value
      setWizardData({
        ...wizardData,
        [field]: {
          ...obj,
          [subField]: updated
        }
      })
    } else {
      const updated = [...(wizardData[field] as string[])]
      updated[index] = value
      setWizardData({
        ...wizardData,
        [field]: updated
      })
    }
  }

  const removeArrayItem = (field: keyof WizardData, index: number, subField?: string) => {
    if (subField && field in wizardData) {
      const obj = wizardData[field] as any
      setWizardData({
        ...wizardData,
        [field]: {
          ...obj,
          [subField]: obj[subField].filter((_: any, i: number) => i !== index)
        }
      })
    } else {
      setWizardData({
        ...wizardData,
        [field]: (wizardData[field] as string[]).filter((_, i) => i !== index)
      })
    }
  }

  const canProceed = () => {
    if (currentStep === 0) return wizardData.framework !== ''
    if (currentStep === 1) return wizardData.name.trim() !== '' && wizardData.description.trim() !== ''
    if (currentStep === 2) return wizardData.vision.trim() !== '' && wizardData.goals.some(g => g.trim() !== '')
    return true
  }

  const handleNext = () => {
    if (canProceed()) {
      setCurrentStep(currentStep + 1)
    } else {
      toast.error('Please complete required fields')
    }
  }

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleComplete = async () => {
    const frameworkName = wizardData.framework === 'custom' ? 'Custom Framework' : frameworks.find(f => f.id === wizardData.framework)?.name || 'Custom'
    
    const assumptions: string[] = []
    
    if (wizardData.framework === 'swot' && wizardData.swot) {
      const strengths = wizardData.swot.strengths.filter(s => s.trim() !== '')
      const weaknesses = wizardData.swot.weaknesses.filter(w => w.trim() !== '')
      const opportunities = wizardData.swot.opportunities.filter(o => o.trim() !== '')
      const threats = wizardData.swot.threats.filter(t => t.trim() !== '')
      
      if (strengths.length) assumptions.push(`Strengths: ${strengths.join(', ')}`)
      if (weaknesses.length) assumptions.push(`Weaknesses: ${weaknesses.join(', ')}`)
      if (opportunities.length) assumptions.push(`Opportunities: ${opportunities.join(', ')}`)
      if (threats.length) assumptions.push(`Threats: ${threats.join(', ')}`)
    } else if (wizardData.framework === 'porters' && wizardData.porters) {
      if (wizardData.porters.competitiveRivalry) assumptions.push(`Competitive Rivalry: ${wizardData.porters.competitiveRivalry}`)
      if (wizardData.porters.supplierPower) assumptions.push(`Supplier Power: ${wizardData.porters.supplierPower}`)
      if (wizardData.porters.buyerPower) assumptions.push(`Buyer Power: ${wizardData.porters.buyerPower}`)
      if (wizardData.porters.threatOfSubstitution) assumptions.push(`Threat of Substitution: ${wizardData.porters.threatOfSubstitution}`)
      if (wizardData.porters.threatOfNewEntry) assumptions.push(`Threat of New Entry: ${wizardData.porters.threatOfNewEntry}`)
    } else if (wizardData.framework === 'blue-ocean' && wizardData.blueOcean) {
      const eliminate = wizardData.blueOcean.eliminate.filter(e => e.trim() !== '')
      const reduce = wizardData.blueOcean.reduce.filter(r => r.trim() !== '')
      const raise = wizardData.blueOcean.raise.filter(r => r.trim() !== '')
      const create = wizardData.blueOcean.create.filter(c => c.trim() !== '')
      
      if (eliminate.length) assumptions.push(`Eliminate: ${eliminate.join(', ')}`)
      if (reduce.length) assumptions.push(`Reduce: ${reduce.join(', ')}`)
      if (raise.length) assumptions.push(`Raise: ${raise.join(', ')}`)
      if (create.length) assumptions.push(`Create: ${create.join(', ')}`)
    }

    const newStrategy: StrategyCard = {
      id: `strategy-${Date.now()}`,
      title: wizardData.name,
      framework: frameworkName,
      vision: wizardData.vision,
      goals: wizardData.goals.filter(g => g.trim() !== ''),
      metrics: wizardData.metrics.filter(m => m.trim() !== ''),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      assumptions
    }

    setStrategyCards((current) => [...(current || []), newStrategy])
    toast.success('Strategy created successfully!')
    
    setWizardData({
      framework: '',
      name: '',
      description: '',
      vision: '',
      goals: ['', '', ''],
      metrics: ['', '', ''],
      swot: {
        strengths: ['', ''],
        weaknesses: ['', ''],
        opportunities: ['', ''],
        threats: ['', '']
      },
      porters: {
        competitiveRivalry: '',
        supplierPower: '',
        buyerPower: '',
        threatOfSubstitution: '',
        threatOfNewEntry: ''
      },
      blueOcean: {
        eliminate: ['', ''],
        reduce: ['', ''],
        raise: ['', ''],
        create: ['', '']
      }
    })
    setCurrentStep(0)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Choose a Strategic Framework</h3>
              <p className="text-sm text-muted-foreground">
                Select a proven framework to guide your strategy development
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {frameworks.map((framework) => {
                const Icon = framework.icon
                return (
                  <Card
                    key={framework.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      wizardData.framework === framework.id ? 'border-accent border-2' : ''
                    }`}
                    onClick={() => setWizardData({ ...wizardData, framework: framework.id })}
                  >
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className={`${framework.color} p-3 rounded-lg`}>
                          <Icon size={24} weight="bold" className="text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base">{framework.name}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {framework.description}
                          </CardDescription>
                        </div>
                        {wizardData.framework === framework.id && (
                          <CheckCircle size={24} weight="fill" className="text-accent" />
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Basic Strategy Information</h3>
              <p className="text-sm text-muted-foreground">
                Give your strategy a clear name and description
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="strategy-name">Strategy Name *</Label>
                <Input
                  id="strategy-name"
                  value={wizardData.name}
                  onChange={(e) => setWizardData({ ...wizardData, name: e.target.value })}
                  placeholder="e.g., Digital Transformation 2025"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="strategy-description">Description *</Label>
                <Textarea
                  id="strategy-description"
                  value={wizardData.description}
                  onChange={(e) => setWizardData({ ...wizardData, description: e.target.value })}
                  placeholder="Describe the purpose and scope of this strategy..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Vision & Strategic Goals</h3>
              <p className="text-sm text-muted-foreground">
                Define your long-term vision and key goals
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="vision">Vision Statement *</Label>
                <Textarea
                  id="vision"
                  value={wizardData.vision}
                  onChange={(e) => setWizardData({ ...wizardData, vision: e.target.value })}
                  placeholder="Where do you want to be in 3-5 years?"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Strategic Goals</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addArrayItem('goals')}
                  >
                    + Add Goal
                  </Button>
                </div>
                {wizardData.goals.map((goal, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={goal}
                      onChange={(e) => updateArrayItem('goals', index, e.target.value)}
                      placeholder={`Goal ${index + 1}`}
                    />
                    {wizardData.goals.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem('goals', index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 3:
        if (wizardData.framework === 'swot') {
          return (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">SWOT Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Analyze your internal strengths & weaknesses, and external opportunities & threats
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Strengths (Internal, Positive)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {wizardData.swot?.strengths.map((strength, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={strength}
                          onChange={(e) => updateArrayItem('swot', index, e.target.value, 'strengths')}
                          placeholder={`Strength ${index + 1}`}
                          className="text-sm"
                        />
                        {(wizardData.swot?.strengths.length || 0) > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeArrayItem('swot', index, 'strengths')}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('swot', 'strengths')}
                      className="w-full"
                    >
                      + Add Strength
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Weaknesses (Internal, Negative)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {wizardData.swot?.weaknesses.map((weakness, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={weakness}
                          onChange={(e) => updateArrayItem('swot', index, e.target.value, 'weaknesses')}
                          placeholder={`Weakness ${index + 1}`}
                          className="text-sm"
                        />
                        {(wizardData.swot?.weaknesses.length || 0) > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeArrayItem('swot', index, 'weaknesses')}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('swot', 'weaknesses')}
                      className="w-full"
                    >
                      + Add Weakness
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Opportunities (External, Positive)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {wizardData.swot?.opportunities.map((opportunity, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={opportunity}
                          onChange={(e) => updateArrayItem('swot', index, e.target.value, 'opportunities')}
                          placeholder={`Opportunity ${index + 1}`}
                          className="text-sm"
                        />
                        {(wizardData.swot?.opportunities.length || 0) > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeArrayItem('swot', index, 'opportunities')}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('swot', 'opportunities')}
                      className="w-full"
                    >
                      + Add Opportunity
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Threats (External, Negative)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {wizardData.swot?.threats.map((threat, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={threat}
                          onChange={(e) => updateArrayItem('swot', index, e.target.value, 'threats')}
                          placeholder={`Threat ${index + 1}`}
                          className="text-sm"
                        />
                        {(wizardData.swot?.threats.length || 0) > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeArrayItem('swot', index, 'threats')}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('swot', 'threats')}
                      className="w-full"
                    >
                      + Add Threat
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )
        } else if (wizardData.framework === 'porters') {
          return (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Porter's Five Forces Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Assess competitive forces shaping your industry
                </p>
              </div>
              <div className="space-y-3">
                <div className="grid gap-2">
                  <Label>Competitive Rivalry</Label>
                  <Textarea
                    value={wizardData.porters?.competitiveRivalry || ''}
                    onChange={(e) => setWizardData({
                      ...wizardData,
                      porters: { ...wizardData.porters!, competitiveRivalry: e.target.value }
                    })}
                    placeholder="Assess the intensity of competition among existing competitors..."
                    rows={2}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Supplier Power</Label>
                  <Textarea
                    value={wizardData.porters?.supplierPower || ''}
                    onChange={(e) => setWizardData({
                      ...wizardData,
                      porters: { ...wizardData.porters!, supplierPower: e.target.value }
                    })}
                    placeholder="How much power do suppliers have to drive up prices?..."
                    rows={2}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Buyer Power</Label>
                  <Textarea
                    value={wizardData.porters?.buyerPower || ''}
                    onChange={(e) => setWizardData({
                      ...wizardData,
                      porters: { ...wizardData.porters!, buyerPower: e.target.value }
                    })}
                    placeholder="How much power do customers have to drive prices down?..."
                    rows={2}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Threat of Substitution</Label>
                  <Textarea
                    value={wizardData.porters?.threatOfSubstitution || ''}
                    onChange={(e) => setWizardData({
                      ...wizardData,
                      porters: { ...wizardData.porters!, threatOfSubstitution: e.target.value }
                    })}
                    placeholder="How easy is it for customers to find alternatives?..."
                    rows={2}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Threat of New Entry</Label>
                  <Textarea
                    value={wizardData.porters?.threatOfNewEntry || ''}
                    onChange={(e) => setWizardData({
                      ...wizardData,
                      porters: { ...wizardData.porters!, threatOfNewEntry: e.target.value }
                    })}
                    placeholder="How easy is it for new competitors to enter the market?..."
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )
        } else if (wizardData.framework === 'blue-ocean') {
          return (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Blue Ocean Strategy Canvas</h3>
                <p className="text-sm text-muted-foreground">
                  Identify factors to eliminate, reduce, raise, and create
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-destructive/50">
                  <CardHeader>
                    <CardTitle className="text-sm text-destructive">Eliminate</CardTitle>
                    <CardDescription className="text-xs">What factors should be eliminated?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {wizardData.blueOcean?.eliminate.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={item}
                          onChange={(e) => updateArrayItem('blueOcean', index, e.target.value, 'eliminate')}
                          placeholder={`Factor ${index + 1}`}
                          className="text-sm"
                        />
                        {(wizardData.blueOcean?.eliminate.length || 0) > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeArrayItem('blueOcean', index, 'eliminate')}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('blueOcean', 'eliminate')}
                      className="w-full"
                    >
                      + Add Factor
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-orange-500/50">
                  <CardHeader>
                    <CardTitle className="text-sm text-orange-600">Reduce</CardTitle>
                    <CardDescription className="text-xs">What should be reduced below standard?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {wizardData.blueOcean?.reduce.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={item}
                          onChange={(e) => updateArrayItem('blueOcean', index, e.target.value, 'reduce')}
                          placeholder={`Factor ${index + 1}`}
                          className="text-sm"
                        />
                        {(wizardData.blueOcean?.reduce.length || 0) > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeArrayItem('blueOcean', index, 'reduce')}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('blueOcean', 'reduce')}
                      className="w-full"
                    >
                      + Add Factor
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-blue-500/50">
                  <CardHeader>
                    <CardTitle className="text-sm text-blue-600">Raise</CardTitle>
                    <CardDescription className="text-xs">What should be raised above standard?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {wizardData.blueOcean?.raise.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={item}
                          onChange={(e) => updateArrayItem('blueOcean', index, e.target.value, 'raise')}
                          placeholder={`Factor ${index + 1}`}
                          className="text-sm"
                        />
                        {(wizardData.blueOcean?.raise.length || 0) > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeArrayItem('blueOcean', index, 'raise')}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('blueOcean', 'raise')}
                      className="w-full"
                    >
                      + Add Factor
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-green-500/50">
                  <CardHeader>
                    <CardTitle className="text-sm text-green-600">Create</CardTitle>
                    <CardDescription className="text-xs">What should be created?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {wizardData.blueOcean?.create.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={item}
                          onChange={(e) => updateArrayItem('blueOcean', index, e.target.value, 'create')}
                          placeholder={`Factor ${index + 1}`}
                          className="text-sm"
                        />
                        {(wizardData.blueOcean?.create.length || 0) > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeArrayItem('blueOcean', index, 'create')}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('blueOcean', 'create')}
                      className="w-full"
                    >
                      + Add Factor
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )
        } else {
          return (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Custom Strategy Details</h3>
                <p className="text-sm text-muted-foreground">
                  Add any additional analysis or context for your custom framework
                </p>
              </div>
              <div className="grid gap-2">
                <Label>Additional Context (Optional)</Label>
                <Textarea
                  placeholder="Add any relevant analysis, market research, or strategic context..."
                  rows={8}
                />
              </div>
            </div>
          )
        }

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Success Metrics</h3>
              <p className="text-sm text-muted-foreground">
                Define how you'll measure the success of this strategy
              </p>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Key Metrics</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addArrayItem('metrics')}
                >
                  + Add Metric
                </Button>
              </div>
              {wizardData.metrics.map((metric, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={metric}
                    onChange={(e) => updateArrayItem('metrics', index, e.target.value)}
                    placeholder={`e.g., Revenue growth of 25% YoY`}
                  />
                  {wizardData.metrics.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem('metrics', index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )

      case 5:
        const selectedFramework = frameworks.find(f => f.id === wizardData.framework)
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Review Your Strategy</h3>
              <p className="text-sm text-muted-foreground">
                Review all details before creating your strategy card
              </p>
            </div>
            <div className="space-y-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Badge>{selectedFramework?.name}</Badge>
                    <CardTitle className="text-base">{wizardData.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Description</Label>
                    <p className="text-sm mt-1">{wizardData.description}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Vision</Label>
                    <p className="text-sm mt-1">{wizardData.vision}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Goals</Label>
                    <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                      {wizardData.goals.filter(g => g.trim() !== '').map((goal, i) => (
                        <li key={i}>{goal}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Metrics</Label>
                    <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                      {wizardData.metrics.filter(m => m.trim() !== '').map((metric, i) => (
                        <li key={i}>{metric}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Guided Strategy Creation</h2>
        <p className="text-muted-foreground mt-2">
          Step-by-step wizard to create comprehensive strategy cards
        </p>
      </div>

      <Card className="border-2">
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{steps[currentStep].title}</CardTitle>
                <CardDescription>{steps[currentStep].description}</CardDescription>
              </div>
              <Badge variant="secondary">
                Step {currentStep + 1} of {steps.length}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="min-h-[400px]">
          {renderStep()}
        </CardContent>
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <div className="flex gap-2">
            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext} disabled={!canProceed()} className="gap-2">
                Next
                <ArrowRight size={16} />
              </Button>
            ) : (
              <Button onClick={handleComplete} className="gap-2">
                <CheckCircle size={16} weight="bold" />
                Create Strategy
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
