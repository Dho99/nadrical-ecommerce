import { orderRepository } from './order.repository'

export interface UploadedPaymentProof {
  order_number: string
  uploaded_at: string
  file_name: string
}

export interface UploadPaymentProofArgs {
  sender_name: string
  sender_bank: string
  amount_paid: number
  proof: File
  note?: string
}

export const paymentProofService = {
  async upload(
    orderId: string | undefined,
    orderNumber: string,
    input: UploadPaymentProofArgs,
  ): Promise<UploadedPaymentProof> {
    if (!orderId) {
      throw new Error('Order ID tidak tersedia. Ulangi checkout atau buka halaman dari detail pesanan.')
    }

    const form = new FormData()
    form.append('sender_name', input.sender_name)
    form.append('sender_bank', input.sender_bank)
    form.append('amount_paid', String(input.amount_paid))
    form.append('payment_proof', input.proof)
    if (input.note?.trim()) form.append('reference_number', input.note.trim())

    await orderRepository.submitPaymentWithProof(orderId, form)

    return {
      order_number: orderNumber,
      uploaded_at: new Date().toISOString(),
      file_name: input.proof.name,
    }
  },
}
