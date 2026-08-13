import { ProfileOverview, useProfileStats } from '../../modules/profile'
import { useAuth } from '../../modules/auth'

export function ProfilePage() {
  const { user } = useAuth()
  const { stats } = useProfileStats(user?.email ?? null)

  if (!user) return null

  return <ProfileOverview user={user} stats={stats} />
}
