'use server';

/**
 * @fileOverview Summarizes a PDF document using Genkit.
 *
 * - summarizePdf - A function that takes a PDF data URI and returns a summary.
 * - SummarizePdfInput - The input type for the summarizePdf function.
 * - SummarizePdfOutput - The return type for the summarizePdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizePdfInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "The PDF document to summarize, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type SummarizePdfInput = z.infer<typeof SummarizePdfInputSchema>;

const SummarizePdfOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the PDF document.'),
});
export type SummarizePdfOutput = z.infer<typeof SummarizePdfOutputSchema>;

export async function summarizePdf(input: SummarizePdfInput): Promise<SummarizePdfOutput> {
  return summarizePdfFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizePdfPrompt',
  input: {schema: SummarizePdfInputSchema},
  output: {schema: SummarizePdfOutputSchema},
  prompt: `You are an expert at summarizing documents.

  The user has provided a PDF document. Your task is to provide a clear and concise summary of its content.
  Focus on the main ideas, key points, and overall message of the document.

  Here is the document:
  {{media url=pdfDataUri}}
  `,
});

const summarizePdfFlow = ai.defineFlow(
  {
    name: 'summarizePdfFlow',
    inputSchema: SummarizePdfInputSchema,
    outputSchema: SummarizePdfOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
