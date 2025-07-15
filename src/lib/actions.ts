import { z } from 'zod';

const optimizeSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters.'),
});

interface OptimizationResult {
  optimizedDescription: string;
  explanation: string;
}

interface ActionState {
  message: string | null;
  errors: { description?: string[] } | null;
  data: OptimizationResult | null;
}

export async function optimizeServiceDescription(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validatedFields = optimizeSchema.safeParse({
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed',
      errors: validatedFields.error.flatten().fieldErrors,
      data: null,
    };
  }

  const { description } = validatedFields.data;

  try {
    // Simulate AI optimization
    const optimizedDescription = `Optimized: ${description.toUpperCase()}`;
    const explanation = `This description was optimized by converting it to uppercase. In a real scenario, an AI model would provide a more sophisticated optimization and explanation.`;

    return {
      message: 'Optimization successful',
      errors: null,
      data: { optimizedDescription, explanation },
    };
  } catch (error) {
    console.error('Optimization error:', error);
    return {
      message: 'An unexpected error occurred during optimization.',
      errors: null,
      data: null,
    };
  }
}