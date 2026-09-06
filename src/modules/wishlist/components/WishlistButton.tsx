import { BookmarkCheck, Bookmark } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from '@/shared/lib/alert'
import { cn } from '../../../shared/utils/cn'
import { useWishlist } from '../hooks/useWishlist'

interface WishlistButtonProps {
  productId: string
  productName?: string
  className?: string
  size?: 'icon' | 'icon-sm' | 'sm'
  variant?: 'ghost' | 'outline'
  showToast?: boolean
  'aria-label'?: string
}

export function WishlistButton({
  productId,
  productName,
  className,
  size = 'icon',
  variant = 'ghost',
  showToast = true,
  ...rest
}: WishlistButtonProps) {
  const { has, toggle } = useWishlist()
  const navigate = useNavigate()
  const wished = has(productId)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const added = toggle(productId)
    if (showToast) {
      if (added) {
        toast.success('Saved to wishlist', {
          description: productName,
          action: {
            label: 'Lihat',
            onClick: () => navigate('/profile/wishlist'),
          },
        })
      } else {
        toast.info('Removed from wishlist', { description: productName })
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={wished}
      aria-label={rest['aria-label'] ?? (wished ? 'Remove from wishlist' : 'Add to wishlist')}
      title={wished ? 'Remove from wishlist' : 'Add to wishlist'}
      className={cn(
        'inline-flex items-center justify-center rounded-full transition-colors',
        variant === 'outline' ? 'border bg-background hover:bg-accent' : 'hover:bg-accent',
        size === 'icon-sm' && 'size-8',
        size === 'icon' && 'size-9',
        size === 'sm' && 'h-8 px-2.5',
        wished ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
        className,
      )}
    >
      {wished ? <BookmarkCheck className="size-[18px] fill-current" /> : <Bookmark className="size-[18px]" />}
    </button>
  )
}
