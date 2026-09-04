export const OPEN_WISHLIST_EVENT = 'nadrical:open-wishlist'

export function openWishlistDialog(): void {
  window.dispatchEvent(new CustomEvent(OPEN_WISHLIST_EVENT))
}
