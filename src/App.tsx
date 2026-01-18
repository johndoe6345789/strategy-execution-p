import { useKV } from '@github/spark/hooks'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Strategy, ChartBar, FolderOpen, Target } from '@phosphor-icons/react'
import StrategyCards from './components/StrategyCards'
import Workbench from './components/Workbench'
import Portfolios from './components/Portfolios'
import Dashboard from './components/Dashboard'
import type { StrategyCard, Initiative } from './types'

function App() {
  const [strategyCards] = useKV<StrategyCard[]>('strategy-cards', [])
  const [initiatives] = useKV<Initiative[]>('initiatives', [])
  const [activeTab, setActiveTab] = useState('strategy')

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                StrategyOS
              </h1>
              <p className="text-sm text-muted-foreground mt-1 font-medium tracking-wide uppercase">
                Strategy Management Platform
              </p>
            </div>
            <div className="flex items-center gap-6 font-mono text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider">Cards</span>
                <span className="text-accent font-semibold text-base">{strategyCards?.length || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider">Initiatives</span>
                <span className="text-accent font-semibold text-base">{initiatives?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 h-14 bg-muted/50">
            <TabsTrigger value="strategy" className="gap-2 text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Strategy size={20} weight="bold" />
              Strategy Cards
            </TabsTrigger>
            <TabsTrigger value="workbench" className="gap-2 text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ChartBar size={20} weight="bold" />
              Workbench
            </TabsTrigger>
            <TabsTrigger value="portfolios" className="gap-2 text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FolderOpen size={20} weight="bold" />
              Portfolios
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="gap-2 text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Target size={20} weight="bold" />
              Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="strategy" className="mt-0">
            <StrategyCards />
          </TabsContent>

          <TabsContent value="workbench" className="mt-0">
            <Workbench />
          </TabsContent>

          <TabsContent value="portfolios" className="mt-0">
            <Portfolios />
          </TabsContent>

          <TabsContent value="dashboard" className="mt-0">
            <Dashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default App
