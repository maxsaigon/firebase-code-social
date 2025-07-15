'use server';

import { optimizeServiceDescription as optimize } from '@/ai/flows/service-description-optimizer';
import type { OptimizeServiceDescriptionInput } from '@/ai/flows/service-description-optimizer';
import { z } from 'zod';

const schema = z.object({
  description: z.string().min(10, { message: 'Description must be at least 10 characters long.' }),
});

export async function optimizeServiceDescription(prevState: any, formData: FormData) {
  const validatedFields = schema.safeParse({
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed',
      errors: validatedFields.error.flatten().fieldErrors,
      data: null,
    };
  }

  try {
    const result = await optimize({ description: validatedFields.data.description });
    return {
      message: 'Success',
      errors: null,
      data: result,
    };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      message: `An unexpected error occurred: ${errorMessage}`,
      errors: null,
      data: null,
    };
  }
}
