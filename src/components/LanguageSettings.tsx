import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, Globe, Translate, Calendar as CalendarIcon, CurrencyDollar, Clock } from '@phosphor-icons/react'
import { toast } from 'sonner'

export type Language = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh' | 'pt' | 'it' | 'ko' | 'ar' | 'ru' | 'hi'
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'DD.MM.YYYY'
export type TimeFormat = '12h' | '24h'
export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'BRL' | 'INR' | 'KRW' | 'RUB' | 'AUD'

interface LanguageSettings {
  language: Language
  dateFormat: DateFormat
  timeFormat: TimeFormat
  currency: Currency
  timezone: string
  autoDetect: boolean
}

const languages = {
  en: { label: 'English', native: 'English', flag: '🇺🇸', rtl: false },
  es: { label: 'Spanish', native: 'Español', flag: '🇪🇸', rtl: false },
  fr: { label: 'French', native: 'Français', flag: '🇫🇷', rtl: false },
  de: { label: 'German', native: 'Deutsch', flag: '🇩🇪', rtl: false },
  ja: { label: 'Japanese', native: '日本語', flag: '🇯🇵', rtl: false },
  zh: { label: 'Chinese', native: '中文', flag: '🇨🇳', rtl: false },
  pt: { label: 'Portuguese', native: 'Português', flag: '🇧🇷', rtl: false },
  it: { label: 'Italian', native: 'Italiano', flag: '🇮🇹', rtl: false },
  ko: { label: 'Korean', native: '한국어', flag: '🇰🇷', rtl: false },
  ar: { label: 'Arabic', native: 'العربية', flag: '🇸🇦', rtl: true },
  ru: { label: 'Russian', native: 'Русский', flag: '🇷🇺', rtl: false },
  hi: { label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', rtl: false },
}

const currencies = {
  USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
  EUR: { symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
  JPY: { symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
  BRL: { symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR' },
  INR: { symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  KRW: { symbol: '₩', name: 'Korean Won', locale: 'ko-KR' },
  RUB: { symbol: '₽', name: 'Russian Ruble', locale: 'ru-RU' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
}

const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Sydney',
]

const translationProgress = {
  en: 100,
  es: 95,
  fr: 92,
  de: 90,
  ja: 88,
  zh: 85,
  pt: 93,
  it: 87,
  ko: 82,
  ar: 78,
  ru: 80,
  hi: 75,
}

export default function LanguageSettings() {
  const [settings, setSettings] = useKV<LanguageSettings>('language-settings', {
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',
    timezone: 'America/New_York',
    autoDetect: true
  })

  const updateLanguage = (language: Language) => {
    setSettings((current) => ({ ...(current || {} as LanguageSettings), language }))
    toast.success(`Language changed to ${languages[language].native}`)
  }

  const updateDateFormat = (dateFormat: DateFormat) => {
    setSettings((current) => ({ ...(current || {} as LanguageSettings), dateFormat }))
    toast.success('Date format updated')
  }

  const updateTimeFormat = (timeFormat: TimeFormat) => {
    setSettings((current) => ({ ...(current || {} as LanguageSettings), timeFormat }))
    toast.success('Time format updated')
  }

  const updateCurrency = (currency: Currency) => {
    setSettings((current) => ({ ...(current || {} as LanguageSettings), currency }))
    toast.success(`Currency changed to ${currencies[currency].name}`)
  }

  const updateTimezone = (timezone: string) => {
    setSettings((current) => ({ ...(current || {} as LanguageSettings), timezone }))
    toast.success('Timezone updated')
  }

  const toggleAutoDetect = () => {
    setSettings((current) => ({ 
      ...(current || {} as LanguageSettings), 
      autoDetect: !(current?.autoDetect ?? true) 
    }))
    toast.success(settings?.autoDetect ? 'Auto-detect disabled' : 'Auto-detect enabled')
  }

  const currentSettings = settings || {
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',
    timezone: 'America/New_York',
    autoDetect: true
  }

  const currentLanguage = languages[currentSettings.language]
  const currentCurrency = currencies[currentSettings.currency]

  const exampleDate = new Date()
  const formattedDate = formatDateExample(exampleDate, currentSettings.dateFormat)
  const formattedTime = formatTimeExample(exampleDate, currentSettings.timeFormat)
  const formattedCurrency = formatCurrencyExample(1234.56, currentSettings.currency)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Language & Regional Settings</h2>
          <p className="text-muted-foreground mt-2">
            Configure language, date/time formats, currency, and regional preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Current Language</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-3xl">{currentLanguage.flag}</span>
              <div>
                <div className="text-lg font-bold">{currentLanguage.native}</div>
                <div className="text-xs text-muted-foreground">{currentLanguage.label}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Currency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{currentCurrency.symbol}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentCurrency.name}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Timezone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{currentSettings.timezone.split('/')[1]?.replace('_', ' ')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentSettings.timezone}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="language" className="w-full">
        <TabsList>
          <TabsTrigger value="language">Language</TabsTrigger>
          <TabsTrigger value="formats">Date & Time</TabsTrigger>
          <TabsTrigger value="currency">Currency</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="language" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Language Selection</CardTitle>
              <CardDescription>
                Choose your preferred language for the interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-detect">Auto-detect language from browser</Label>
                <Switch
                  id="auto-detect"
                  checked={currentSettings.autoDetect}
                  onCheckedChange={toggleAutoDetect}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="language-select">Interface Language</Label>
                <Select
                  value={currentSettings.language}
                  onValueChange={(value: Language) => updateLanguage(value)}
                  disabled={currentSettings.autoDetect}
                >
                  <SelectTrigger id="language-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(languages).map(([code, lang]) => (
                      <SelectItem key={code} value={code}>
                        <div className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.native}</span>
                          <span className="text-muted-foreground">({lang.label})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Languages</CardTitle>
              <CardDescription>
                Translation progress for supported languages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(languages).map(([code, lang]) => {
                  const progress = translationProgress[code as Language]
                  return (
                    <div key={code} className="flex items-center gap-4">
                      <div className="flex items-center gap-2 w-48">
                        <span className="text-xl">{lang.flag}</span>
                        <div>
                          <div className="font-medium text-sm">{lang.native}</div>
                          <div className="text-xs text-muted-foreground">{lang.label}</div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold w-10 text-right">{progress}%</span>
                        </div>
                      </div>
                      {progress === 100 && (
                        <CheckCircle size={16} weight="fill" className="text-green-600" />
                      )}
                      {lang.rtl && (
                        <Badge variant="outline" className="text-xs">RTL</Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formats" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Date Format</CardTitle>
              <CardDescription>
                Choose how dates are displayed throughout the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select
                  value={currentSettings.dateFormat}
                  onValueChange={(value: DateFormat) => updateDateFormat(value)}
                >
                  <SelectTrigger id="date-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</SelectItem>
                    <SelectItem value="DD.MM.YYYY">DD.MM.YYYY (31.12.2024)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Example: {formattedDate}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Time Format</CardTitle>
              <CardDescription>
                Choose between 12-hour or 24-hour time display
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="time-format">Time Format</Label>
                <Select
                  value={currentSettings.timeFormat}
                  onValueChange={(value: TimeFormat) => updateTimeFormat(value)}
                >
                  <SelectTrigger id="time-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12-hour (3:45 PM)</SelectItem>
                    <SelectItem value="24h">24-hour (15:45)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Example: {formattedTime}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timezone</CardTitle>
              <CardDescription>
                Set your local timezone for accurate time display
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={currentSettings.timezone}
                  onValueChange={updateTimezone}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="currency" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Currency Settings</CardTitle>
              <CardDescription>
                Configure your preferred currency for financial data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="currency-select">Currency</Label>
                <Select
                  value={currentSettings.currency}
                  onValueChange={(value: Currency) => updateCurrency(value)}
                >
                  <SelectTrigger id="currency-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(currencies).map(([code, curr]) => (
                      <SelectItem key={code} value={code}>
                        {curr.symbol} {curr.name} ({code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Example: {formattedCurrency}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supported Currencies</CardTitle>
              <CardDescription>
                All currencies available in StrategyOS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(currencies).map(([code, curr]) => (
                  <div key={code} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-accent">{curr.symbol}</div>
                    <div>
                      <div className="font-medium text-sm">{curr.name}</div>
                      <div className="text-xs text-muted-foreground">{code}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Format Preview</CardTitle>
              <CardDescription>
                See how your settings will appear throughout the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <CalendarIcon size={24} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Date Format</h4>
                    <p className="text-sm text-muted-foreground">Today's date</p>
                    <p className="text-lg font-bold mt-2">{formattedDate}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Clock size={24} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Time Format</h4>
                    <p className="text-sm text-muted-foreground">Current time</p>
                    <p className="text-lg font-bold mt-2">{formattedTime}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <CurrencyDollar size={24} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Currency Format</h4>
                    <p className="text-sm text-muted-foreground">Sample amount</p>
                    <p className="text-lg font-bold mt-2">{formattedCurrency}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Globe size={24} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Language</h4>
                    <p className="text-sm text-muted-foreground">Interface language</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-2xl">{currentLanguage.flag}</span>
                      <span className="text-lg font-bold">{currentLanguage.native}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-3">Sample Dashboard Preview</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Report Generated:</span>
                    <span className="font-medium">{formattedDate} {formattedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Budget:</span>
                    <span className="font-medium">{formatCurrencyExample(1500000, currentSettings.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Spent to Date:</span>
                    <span className="font-medium">{formatCurrencyExample(875250.50, currentSettings.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining:</span>
                    <span className="font-medium text-green-600">{formatCurrencyExample(624749.50, currentSettings.currency)}</span>
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

function formatDateExample(date: Date, format: DateFormat): string {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()

  switch (format) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`
    case 'DD.MM.YYYY':
      return `${day}.${month}.${year}`
  }
}

function formatTimeExample(date: Date, format: TimeFormat): string {
  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')

  if (format === '12h') {
    const period = hours >= 12 ? 'PM' : 'AM'
    const hours12 = hours % 12 || 12
    return `${hours12}:${minutes} ${period}`
  } else {
    return `${hours.toString().padStart(2, '0')}:${minutes}`
  }
}

function formatCurrencyExample(amount: number, currency: Currency): string {
  const currencyInfo = currencies[currency]
  return new Intl.NumberFormat(currencyInfo.locale, {
    style: 'currency',
    currency: currency
  }).format(amount)
}
