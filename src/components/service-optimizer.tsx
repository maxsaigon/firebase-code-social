'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { optimizeServiceDescription } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { Lightbulb, Sparkles } from 'lucide-react';

const initialState = {
  message: null,
  errors: null,
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Optimizing...' : 'Optimize Description'}
      <Sparkles className="ml-2 h-4 w-4" />
    </Button>
  );
}

export function ServiceOptimizer() {
  const [state, formAction] = useFormState(optimizeServiceDescription, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message === 'Validation failed' && state.errors?.description) {
      toast({
        title: 'Error',
        description: state.errors.description[0],
        variant: 'destructive',
      });
    } else if (state.message && state.message.startsWith('An unexpected error occurred')) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Description Optimizer</CardTitle>
        <CardDescription>
          Use AI to analyze and improve your service descriptions for clarity and appeal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Current Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter your service description here..."
              rows={5}
            />
          </div>
          <SubmitButton />
        </form>

        {state.data && (
          <div className="mt-6 space-y-6">
            <Separator />
            <div>
              <h3 className="text-lg font-semibold flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                Optimized Description
              </h3>
              <p className="mt-2 text-sm text-muted-foreground bg-secondary p-4 rounded-md whitespace-pre-wrap font-body">
                {state.data.optimizedDescription}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-warning" />
                Explanation & Suggestions
              </h3>
              <p className="mt-2 text-sm text-muted-foreground bg-secondary p-4 rounded-md whitespace-pre-wrap font-body">
                {state.data.explanation}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Dummy separator, as shadcn one can't be imported here directly.
const Separator = () => <div className="my-4 h-px w-full bg-border" />;
