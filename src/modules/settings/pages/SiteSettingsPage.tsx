import { useEffect, useState } from 'react'
import { siteSettingsService, type SiteSetting } from '../services/site-settings.service'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea } from '../../../shared/components/ui'
import { AlertCircle, CheckCircle, Loader } from 'lucide-react'

export function SiteSettingsPage() {
  const [settings, setSettings] = useState<Record<string, SiteSetting>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await siteSettingsService.getSettings(['site_title', 'site_tagline', 'hero_banner', 'logo_url'])
        setSettings(data)
      } catch {
        setMessage({ type: 'error', text: 'Failed to load settings' })
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleUpdate = async (key: string, value: string) => {
    try {
      setSaving(key)
      const updated = await siteSettingsService.updateSetting(key, value)
      setSettings(prev => ({ ...prev, [key]: updated }))
      setMessage({ type: 'success', text: `${key} updated` })
      setTimeout(() => setMessage(null), 3000)
    } catch {
      setMessage({ type: 'error', text: `Failed to update ${key}` })
    } finally {
      setSaving(null)
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader className="animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <p className="text-muted-foreground">Manage your site branding and configuration</p>
      </div>

      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.type === 'success' ? <CheckCircle className="size-5" /> : <AlertCircle className="size-5" />}
          {message.text}
        </div>
      )}

      <div className="grid gap-6">
        {/* Site Title */}
        <Card>
          <CardHeader>
            <CardTitle>Site Title</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              defaultValue={settings.site_title?.value || ''}
              placeholder="Your site title"
              onChange={(e) => {
                const newSettings = { ...settings }
                if (newSettings.site_title) newSettings.site_title.value = e.target.value
                setSettings(newSettings)
              }}
            />
            <Button
              onClick={() => handleUpdate('site_title', settings.site_title?.value || '')}
              disabled={saving === 'site_title'}
              size="sm"
            >
              {saving === 'site_title' ? 'Saving...' : 'Save'}
            </Button>
          </CardContent>
        </Card>

        {/* Site Tagline */}
        <Card>
          <CardHeader>
            <CardTitle>Site Tagline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              defaultValue={settings.site_tagline?.value || ''}
              placeholder="Your site tagline or slogan"
              onChange={(e) => {
                const newSettings = { ...settings }
                if (newSettings.site_tagline) newSettings.site_tagline.value = e.target.value
                setSettings(newSettings)
              }}
              rows={2}
            />
            <Button
              onClick={() => handleUpdate('site_tagline', settings.site_tagline?.value || '')}
              disabled={saving === 'site_tagline'}
              size="sm"
            >
              {saving === 'site_tagline' ? 'Saving...' : 'Save'}
            </Button>
          </CardContent>
        </Card>

        {/* Logo URL */}
        <Card>
          <CardHeader>
            <CardTitle>Logo URL</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              type="url"
              defaultValue={settings.logo_url?.value || ''}
              placeholder="https://example.com/logo.svg"
              onChange={(e) => {
                const newSettings = { ...settings }
                if (newSettings.logo_url) newSettings.logo_url.value = e.target.value
                setSettings(newSettings)
              }}
            />
            <Button
              onClick={() => handleUpdate('logo_url', settings.logo_url?.value || '')}
              disabled={saving === 'logo_url'}
              size="sm"
            >
              {saving === 'logo_url' ? 'Saving...' : 'Save'}
            </Button>
          </CardContent>
        </Card>

        {/* Hero Banner */}
        <Card>
          <CardHeader>
            <CardTitle>Hero Banner URL</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              type="url"
              defaultValue={settings.hero_banner?.value || ''}
              placeholder="https://example.com/banner.jpg"
              onChange={(e) => {
                const newSettings = { ...settings }
                if (newSettings.hero_banner) newSettings.hero_banner.value = e.target.value
                setSettings(newSettings)
              }}
            />
            <Button
              onClick={() => handleUpdate('hero_banner', settings.hero_banner?.value || '')}
              disabled={saving === 'hero_banner'}
              size="sm"
            >
              {saving === 'hero_banner' ? 'Saving...' : 'Save'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
