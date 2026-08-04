export function mockDelay(ms = 350): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function mockFail(rate = 0.05): void {
  if (Math.random() < rate) {
    throw new Error('Mock service unavailable. Try again.')
  }
}
