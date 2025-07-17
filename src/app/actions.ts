
'use server'

import { z } from 'zod'
import { checkPriority, type PriorityNotificationOutput } from '@/ai/flows/priority-notifications'

const schema = z.object({
  emailBody: z.string(),
  emailSubject: z.string(),
  sender: z.string(),
})

type State = {
  result: PriorityNotificationOutput | null;
  error: string | null;
  timestamp: number;
} | null

export async function checkEmailPriority(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = schema.safeParse({
    emailBody: formData.get('emailBody'),
    emailSubject: formData.get('emailSubject'),
    sender: formData.get('sender'),
  })

  if (!validatedFields.success) {
    return {
      result: null,
      error: 'Invalid form data.',
      timestamp: Date.now(),
    }
  }

  try {
    const result = await checkPriority(validatedFields.data)
    return { result, error: null, timestamp: Date.now() }
  } catch (e) {
    return {
      result: null,
      error: 'Failed to check priority.',
      timestamp: Date.now(),
    }
  }
}
