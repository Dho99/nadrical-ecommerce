export type ChatRole = 'customer' | 'agent' | 'bot'

export interface ChatMessage {
  id: string
  role: ChatRole
  text: string
  at: string
}

export interface ChatConversation {
  id: string
  customerId: string
  customerName: string
  email?: string
  createdAt: string
  lastActivityAt: string
  messages: ChatMessage[]
  agentReadAt?: string
  customerReadAt?: string
}

export interface ChatIdentity {
  id: string
  name: string
  email?: string
}
