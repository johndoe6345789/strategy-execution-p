# Planning Guide

An integrated strategy management platform that enables organizations to create, align, execute, and track strategic initiatives from conception to delivery, replacing fragmented spreadsheets with a unified source of truth.

**Experience Qualities**:
1. **Authoritative** - Every view, metric, and decision point radiates confidence and clarity, positioning this as the definitive system of record for strategic execution.
2. **Structured yet Flexible** - Guided frameworks accelerate strategy creation while adapting to diverse methodologies (Hoshin Kanri, OKRs, Portfolio Management) without rigid constraints.
3. **Traceable** - Crystal-clear visibility from enterprise goals down to individual initiatives, with instant drill-down and relationship mapping that eliminates ambiguity.

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is an enterprise-grade platform requiring multiple interconnected views (Strategy Cards creation, Workbench execution tracking, Portfolio management, KPI dashboards), role-based workflows, real-time data relationships, and sophisticated visualization of strategic hierarchies and dependencies.

## Essential Features

### Strategy Card Creation
- **Functionality**: Structured strategy formulation using proven frameworks (SWOT, Value Disciplines, Strategic Pillars)
- **Purpose**: Eliminate blank-page paralysis and ensure comprehensive strategic thinking
- **Trigger**: User clicks "Create Strategy Card" or "New Strategic Initiative"
- **Progression**: Select framework → Fill guided sections (Vision, Goals, Assumptions) → Add metrics → Review & Publish → Link to Workbench initiatives
- **Success criteria**: User can create a complete strategy card in under 10 minutes; all critical strategic elements are captured with clear rationale

### Strategy Comparison & Exploration
- **Functionality**: Side-by-side comparison of multiple strategic options to evaluate and refine approaches
- **Purpose**: Enable informed decision-making by comparing strategic alternatives across all key dimensions
- **Trigger**: User navigates to "Compare" tab and selects two strategy cards
- **Progression**: Select Strategy A → Select Strategy B → View side-by-side comparison → Analyze vision, goals, metrics, assumptions → Review summary metrics → Make strategic choice
- **Success criteria**: Users can quickly identify strengths and weaknesses of competing strategies; comparison highlights meaningful differences in scope, metrics, and assumptions

### Initiative Execution Tracking
- **Functionality**: Translate strategic objectives into trackable initiatives with owners, timelines, and KPIs
- **Purpose**: Bridge the gap between strategy and execution with clear accountability
- **Trigger**: User creates initiative from Strategy Card or Workbench portfolio view
- **Progression**: Define initiative → Assign owner → Set timeline & budget → Link strategic goals → Define KPIs → Track status updates
- **Success criteria**: Every initiative clearly traces to strategic goals; real-time status is always current; owners receive clear accountability signals

### Portfolio Management & Governance
- **Functionality**: Group initiatives into portfolios (M&A, OpEx, ESG) with capacity planning and impact analysis
- **Purpose**: Enable enterprise-level prioritization and resource allocation decisions
- **Trigger**: User navigates to "Portfolios" and creates/manages portfolio groups
- **Progression**: Create portfolio → Add initiatives → Analyze capacity vs demand → Assess alignment score → Prioritize → Review governance dashboard
- **Success criteria**: Leadership can assess entire strategic portfolio at a glance; capacity conflicts are immediately visible; prioritization decisions are data-informed

### Real-Time KPI Dashboard
- **Functionality**: Multi-level scorecards from enterprise to initiative with drill-down capability
- **Purpose**: Provide unified visibility into strategic progress and financial outcomes
- **Trigger**: User accesses Dashboard or clicks metric in any view
- **Progression**: View enterprise scorecard → Select portfolio or initiative → Drill into specific KPI → View trend & targets → Navigate to related initiatives
- **Success criteria**: No ambiguity about performance; financial and operational metrics connected; accessible to all stakeholders

### Strategic Roadmap with Hoshin Kanri
- **Functionality**: Comprehensive project planning with objectives, metrics, bowling charts, X-Matrix, and timeline visualization
- **Purpose**: Enable end-to-end strategic planning and execution tracking using proven Hoshin Kanri methodology
- **Trigger**: User navigates to Roadmap tab and accesses sub-views (Projects, Dashboard, Timeline, Objectives, Metrics, Bowling Chart, X-Matrix)
- **Progression**: Create project → Add objectives (breakthrough/annual/improvement) → Define metrics with baseline/current/target → Track progress → View bowling chart → Analyze X-Matrix alignment → Monitor timeline
- **Success criteria**: Complete visibility of strategic execution; objectives linked to measurable metrics; monthly bowling chart shows status at a glance; X-Matrix demonstrates strategic alignment; timeline shows project scheduling and dependencies

### Strategy-to-Execution Traceability
- **Functionality**: Visual relationship mapping showing how initiatives link to strategic goals and outcomes with orphan detection
- **Purpose**: Ensure every activity directly supports strategic intent; identify gaps and misalignments
- **Trigger**: User clicks "Trace" tab or "View Connections" on any initiative
- **Progression**: Select strategy card → View all linked initiatives → Examine status and progress → Identify orphaned initiatives or strategies without initiatives → Create new links as needed
- **Success criteria**: Complete line of sight from daily work to enterprise strategy; no orphaned initiatives; warnings surface for strategies without execution initiatives

### X-Matrix for Hoshin Kanri
- **Functionality**: Interactive X-Matrix aligning breakthrough objectives (3-5 year) with annual objectives, metrics, and improvement actions
- **Purpose**: Enable visual strategic alignment using proven Hoshin Kanri methodology with relationship strength indicators
- **Trigger**: User navigates to "X-Matrix" tab to build or view strategic alignment
- **Progression**: Add breakthrough objectives → Add annual objectives → Define metrics → List improvement actions → Map relationships with strong/medium/weak indicators → Analyze alignment patterns
- **Success criteria**: Complete visibility of strategic cascading from long-term breakthroughs to annual goals to tactical improvements; clear relationship strengths guide prioritization; gaps in alignment are immediately visible

### Bowling Chart for Monthly Tracking
- **Functionality**: Visual monthly progress tracking with red/yellow/green status indicators and actual vs target metrics
- **Purpose**: Provide at-a-glance monthly status visibility using familiar stoplight indicators for rapid assessment
- **Trigger**: User navigates to "Bowling" tab to view or update monthly status
- **Progression**: Add objectives to track → Update monthly status (green/yellow/red) → Enter actual vs target values → View aggregate status counts → Identify trends and patterns
- **Success criteria**: Instant recognition of problem areas through color coding; month-over-month trends visible; actual vs target metrics provide quantitative backup to qualitative status

## Edge Case Handling

- **Orphaned Initiatives** - Display warnings when initiatives lack strategic linkage; suggest potential connections
- **Capacity Overload** - Flag portfolios exceeding resource capacity with visual indicators; recommend rebalancing
- **Stale Data** - Highlight KPIs and initiatives not updated within defined thresholds; send gentle reminders to owners
- **Conflicting Priorities** - Surface initiatives competing for same resources with conflict resolution workflow
- **Incomplete Strategy Cards** - Auto-save drafts; provide completion checklist; allow progressive elaboration
- **Access Control** - Role-based visibility ensuring executives see enterprise view while contributors focus on their initiatives

## Design Direction

The design should evoke **executive confidence, operational precision, and strategic clarity**. This is a tool for serious decisions—it must feel authoritative without being bureaucratic, data-rich without overwhelming, and sophisticated yet accessible. Visual language should suggest enterprise-grade reliability (think Bloomberg Terminal meets modern SaaS), with clear hierarchies, purposeful data density, and confident use of space to signal importance.

## Color Selection

**Deep Navy & Gold Executive Palette** - Conveys authority, strategic thinking, and high-stakes decision-making appropriate for C-suite and strategy offices.

- **Primary Color**: Deep Navy `oklch(0.28 0.05 250)` - Strategic authority and executive presence; used for primary navigation, key actions, and strategic elements
- **Secondary Colors**: 
  - Slate `oklch(0.42 0.02 250)` - Supporting structure for secondary actions and containers
  - Cool Gray `oklch(0.92 0.01 250)` - Subtle backgrounds and dividers maintaining visual hierarchy
- **Accent Color**: Rich Gold `oklch(0.72 0.14 85)` - Strategic focus and achievement; highlights critical metrics, success states, and high-priority initiatives
- **Foreground/Background Pairings**: 
  - Primary Navy (oklch(0.28 0.05 250)): White text (oklch(0.99 0 0)) - Ratio 11.2:1 ✓
  - Slate (oklch(0.42 0.02 250)): White text (oklch(0.99 0 0)) - Ratio 6.8:1 ✓
  - Gold Accent (oklch(0.72 0.14 85)): Deep Navy text (oklch(0.28 0.05 250)) - Ratio 4.9:1 ✓
  - Background (oklch(0.98 0.005 250)): Foreground text (oklch(0.25 0.02 250)) - Ratio 13.4:1 ✓

## Font Selection

Typography should communicate **executive gravitas, analytical precision, and structured thinking**—appropriate for strategy documents and financial reporting while remaining highly scannable for dashboard views.

- **Typographic Hierarchy**: 
  - H1 (Strategic Section Headers): Outfit Bold / 32px / tight (-0.02em) - Commands attention for major sections
  - H2 (Portfolio/Card Titles): Outfit SemiBold / 24px / tight (-0.01em) - Clear hierarchical signaling
  - H3 (Initiative Titles): Outfit Medium / 18px / normal - Balanced weight for scannability
  - Body (Descriptions/Content): Inter Regular / 15px / relaxed (1.6) - Exceptional readability for detailed content
  - Data/Metrics: JetBrains Mono Medium / 14px / normal - Precision and clarity for numbers, KPIs, dates
  - Captions/Labels: Inter Medium / 13px / wide (0.01em) / uppercase - Clear visual separation for metadata

## Animations

Animations should reinforce the sense of **authoritative transitions and data relationships**, never frivolous. Use purposeful motion to guide attention during navigation between strategy levels (enterprise → portfolio → initiative), smooth drill-downs that maintain spatial context, and subtle highlights when metrics update or thresholds are crossed. Strategic elements should feel weighty—cards and modals transition with slight deceleration suggesting substance and importance.

## Component Selection

- **Components**: 
  - `Card` - Primary container for Strategy Cards, initiative summaries, and portfolio groups; add subtle shadow and border treatment for depth
  - **Sidebar Navigation** - Hierarchical left sidebar with grouped sections (Planning, Execution, Hoshin Kanri, Roadmaps, Reporting) with collapsible/expandable sections for better space management and visual organization
  - `Dialog` - Full-screen modals for creating/editing Strategy Cards and initiatives with structured forms
  - `Table` - Initiative lists, KPI scorecards, and portfolio views with sortable columns and row hover states
  - `Badge` - Status indicators (On Track, At Risk, Blocked), priority levels, and portfolio tags with semantic colors
  - `Progress` - Visual representation of initiative completion, capacity utilization, and KPI achievement
  - `Select` - Framework selection, owner assignment, portfolio categorization with clear dropdown styling
  - `Button` - Primary actions use solid navy with gold hover accent; secondary actions use outline style
  - `Separator` - Clear visual breaks between strategy sections and dashboard panels
  - `Avatar` - Owner identification with fallback initials
  - `ScrollArea` - Smooth scrolling for long strategy content and initiative lists
  
- **Customizations**: 
  - Strategy Card component with collapsible framework sections (Vision, Goals, Metrics, Assumptions)
  - Traceability visualization using connected cards or tree view showing goal → initiative relationships
  - Portfolio capacity gauge combining Progress with numeric indicators
  - KPI scorecard component with trend indicators (up/down arrows) and target comparison
  - Initiative timeline component showing milestones and current progress
  - **Home Dashboard** - Landing view with categorized module cards for intuitive entry into different functional areas
  
- **States**: 
  - Buttons: Navy default → Gold hover → Pressed with slight scale → Disabled with reduced opacity
  - Cards: Subtle hover elevation; active state with gold left border; selected state with gold outline
  - **Sidebar Items**: Default state with regular icon weight → Hover with accent background → Active with filled icon, primary background and shadow
  - **Sidebar Section Headers**: Clickable with caret icon → Hover with accent background → Collapsed state rotates caret 90° with smooth animation
  - Table rows: Hover with light slate background; selected with stronger slate background
  - Status badges: Green (On Track), Amber (At Risk), Red (Blocked), Gray (Not Started)
  
- **Icon Selection**: 
  - `House` - Home dashboard navigation
  - `CaretDown` - Collapsible section indicators in sidebar
  - `Strategy` - Use structured grid or layers icon for Strategy Cards
  - `ChartBar` - Workbench and execution tracking
  - `FolderOpen` - Portfolio management
  - `Target` - Goals and KPIs
  - `Tree` - Traceability and connections
  - `Plus` - Create new cards/initiatives
  - `ArrowRight` - Drill-down and navigation
  - `Warning` - Risk flags and capacity alerts
  - `TrendUp/TrendDown` - KPI performance indicators
  - `ArrowsLeftRight` - Strategy comparison
  - `GridFour` - X-Matrix
  - `Circle` - Bowling chart
  - `MapTrifold` - Strategic roadmap
  - `Rocket` - Product roadmap
  
- **Spacing**: 
  - Page margins: `p-8` for generous breathing room around main content
  - Card padding: `p-6` for substantial internal space
  - Section gaps: `gap-6` between major sections; `gap-4` between related elements
  - List items: `py-3` for comfortable touch targets and scannability
  - **Sidebar spacing**: `p-4` container padding; `space-y-6` between sections; `space-y-1` within sections and for collapsible content
  - **Sidebar section headers**: `py-2` for clickable area; smooth 200ms transition for collapse/expand animations
  
- **Mobile**: 
  - Sidebar converts to collapsible drawer with hamburger menu
  - Home dashboard grid stacks to single column
  - Strategy Cards stack vertically with collapsible sections expanded one at a time
  - Tables transform to card-based lists with key data prioritized
  - Portfolio dashboard shows one metric card at a time with horizontal swipe
  - Create/Edit dialogs use full viewport with simplified forms
  - Reduce typographic scale by 10-15% for mobile readability
