'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CompletionStepProps {
  userId: string;
  onRestart: () => void;
}

export function CompletionStep({ userId, onRestart }: CompletionStepProps) {
  useEffect(() => {
    const markComplete = async () => {
      await supabase
        .from('users')
        .update({ completed: true, current_step: 4 })
        .eq('id', userId);
    };

    markComplete();
  }, [userId]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-600" />
        </div>
        <CardTitle className="text-2xl text-center">Congratulations!</CardTitle>
        <p className="text-center text-gray-600">
          You have successfully completed the onboarding process.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={onRestart}
            variant="outline"
            className="w-full"
          >
            Start Over
          </Button>
          <div className="text-center text-sm text-gray-500">
            <p>Visit <span className="font-mono">/admin</span> to configure the flow</p>
            <p>Visit <span className="font-mono">/data</span> to view submitted data</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}