'use server';

/**
 * @fileOverview Improves search terms using Genkit to suggest related terms.
 *
 * - improveSearchTerms - A function that takes a search term and returns suggested related terms.
 * - ImproveSearchTermsInput - The input type for the improveSearchTerms function.
 * - ImproveSearchTermsOutput - The return type for the improveSearchTerms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveSearchTermsInputSchema = z.object({
  searchTerm: z.string().describe('The search term to improve.'),
});
export type ImproveSearchTermsInput = z.infer<typeof ImproveSearchTermsInputSchema>;

const ImproveSearchTermsOutputSchema = z.object({
  relatedTerms: z.array(z.string()).describe('Suggested related search terms.'),
});
export type ImproveSearchTermsOutput = z.infer<typeof ImproveSearchTermsOutputSchema>;

export async function improveSearchTerms(input: ImproveSearchTermsInput): Promise<ImproveSearchTermsOutput> {
  return improveSearchTermsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveSearchTermsPrompt',
  input: {schema: ImproveSearchTermsInputSchema},
  output: {schema: ImproveSearchTermsOutputSchema},
  prompt: `You are an expert at suggesting related search terms.

  The user is searching for something in a PDF document, and has provided the following search term:
  {{searchTerm}}

  Suggest 5 related search terms that the user might also find helpful. Return them as a JSON array of strings.
  Do not include the original search term in the list of related terms.`,
});

const improveSearchTermsFlow = ai.defineFlow(
  {
    name: 'improveSearchTermsFlow',
    inputSchema: ImproveSearchTermsInputSchema,
    outputSchema: ImproveSearchTermsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
