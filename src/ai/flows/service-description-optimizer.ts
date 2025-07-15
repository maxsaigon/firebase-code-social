'use server';

/**
 * @fileOverview AI-powered tool to analyze service descriptions and suggest improvements for clarity and appeal.
 *
 * - optimizeServiceDescription - A function that handles the service description optimization process.
 * - OptimizeServiceDescriptionInput - The input type for the optimizeServiceDescription function.
 * - OptimizeServiceDescriptionOutput - The return type for the optimizeServiceDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeServiceDescriptionInputSchema = z.object({
  description: z.string().describe('The service description to optimize.'),
});
export type OptimizeServiceDescriptionInput = z.infer<typeof OptimizeServiceDescriptionInputSchema>;

const OptimizeServiceDescriptionOutputSchema = z.object({
  optimizedDescription: z.string().describe('The optimized service description.'),
  explanation: z.string().describe('Explanation of changes and suggestions.'),
});
export type OptimizeServiceDescriptionOutput = z.infer<typeof OptimizeServiceDescriptionOutputSchema>;

export async function optimizeServiceDescription(input: OptimizeServiceDescriptionInput): Promise<OptimizeServiceDescriptionOutput> {
  return optimizeServiceDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeServiceDescriptionPrompt',
  input: {schema: OptimizeServiceDescriptionInputSchema},
  output: {schema: OptimizeServiceDescriptionOutputSchema},
  prompt: `You are an expert marketing copywriter specializing in optimizing service descriptions to attract more customers.

You will analyze the provided service description and suggest improvements for clarity, appeal, and effectiveness. Provide an optimized description and a detailed explanation of the changes made and suggestions for further improvement.

Service Description:
{{{description}}}`, // The LLM will continue from here, so the prompt should ask for the model to begin writing the Optimized Description. Importantly, it should write both an optimized description AND an explanation.
});

const optimizeServiceDescriptionFlow = ai.defineFlow(
  {
    name: 'optimizeServiceDescriptionFlow',
    inputSchema: OptimizeServiceDescriptionInputSchema,
    outputSchema: OptimizeServiceDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
