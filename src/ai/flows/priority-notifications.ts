'use server';

/**
 * @fileOverview This file contains the Genkit flow for priority notifications.
 *
 * - checkPriority - A function that checks the priority of an email.
 * - PriorityNotificationInput - The input type for the checkPriority function.
 * - PriorityNotificationOutput - The return type for the checkPriority function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PriorityNotificationInputSchema = z.object({
  emailBody: z.string().describe('The body of the email to be checked.'),
  emailSubject: z.string().describe('The subject of the email to be checked.'),
  sender: z.string().describe('The sender of the email.'),
});
export type PriorityNotificationInput = z.infer<typeof PriorityNotificationInputSchema>;

const PriorityNotificationOutputSchema = z.object({
  isImportant: z.boolean().describe('Whether the email contains important information that the user should be notified about.'),
  reason: z.string().describe('The reason why the email is considered important or not important.'),
});
export type PriorityNotificationOutput = z.infer<typeof PriorityNotificationOutputSchema>;

export async function checkPriority(input: PriorityNotificationInput): Promise<PriorityNotificationOutput> {
  return checkPriorityFlow(input);
}

const checkPriorityPrompt = ai.definePrompt({
  name: 'checkPriorityPrompt',
  input: {schema: PriorityNotificationInputSchema},
  output: {schema: PriorityNotificationOutputSchema},
  prompt: `You are an AI assistant designed to analyze emails and determine if they contain important information that a user should be notified about.

  Given the email content below, determine if the email is important and requires immediate attention.
  Consider factors such as urgency, relevance to the user's interests or responsibilities, and potential impact if the email is ignored.

  Email Subject: {{{emailSubject}}}
  Email Sender: {{{sender}}}
  Email Body: {{{emailBody}}}

  Respond with a JSON object indicating whether the email is important (isImportant: boolean) and the reason for your determination (reason: string).`,
});

const checkPriorityFlow = ai.defineFlow(
  {
    name: 'checkPriorityFlow',
    inputSchema: PriorityNotificationInputSchema,
    outputSchema: PriorityNotificationOutputSchema,
  },
  async input => {
    const {output} = await checkPriorityPrompt(input);
    return output!;
  }
);
