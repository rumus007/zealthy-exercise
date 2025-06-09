'use client';

import { useState, useEffect } from 'react';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { EmailPasswordStep } from '@/components/onboarding/EmailPasswordStep';
import { DynamicStep } from '@/components/onboarding/DynamicStep';
import { CompletionStep } from '@/components/onboarding/CompletionStep';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState({
    email: '',
    about_me: '',
    street_address: '',
    city: '',
    state: '',
    zip: '',
    birthdate: '',
  });

  useEffect(() => {
    // Check for existing user in localStorage
    const savedUserId = localStorage.getItem('onboarding_user_id');
    if (savedUserId) {
      loadUserData(savedUserId);
    }
  }, []);

  const loadUserData = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setUserId(id);
      setCurrentStep(data.completed ? 4 : Math.max(2, data.current_step));
      setUserData({
        email: data.email,
        about_me: data.about_me || '',
        street_address: data.street_address || '',
        city: data.city || '',
        state: data.state || '',
        zip: data.zip || '',
        birthdate: data.birthdate || '',
      });
    } catch (err) {
      console.error('Error loading user data:', err);
      localStorage.removeItem('onboarding_user_id');
    }
  };

  const handleEmailPasswordComplete = (id: string) => {
    setUserId(id);
    localStorage.setItem('onboarding_user_id', id);
    setCurrentStep(2);
  };

  const handleStepNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRestart = () => {
    localStorage.removeItem('onboarding_user_id');
    setUserId(null);
    setCurrentStep(1);
    setUserData({
      email: '',
      about_me: '',
      street_address: '',
      city: '',
      state: '',
      zip: '',
      birthdate: '',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Onboarding Process
          </h1>
        </div>

        <ProgressIndicator currentStep={currentStep} totalSteps={4} />

        <div className="flex justify-center">
          {currentStep === 1 && (
            <EmailPasswordStep
              onNext={handleEmailPasswordComplete}
              userId={userId || undefined}
              initialData={{ email: userData.email }}
            />
          )}

          {(currentStep === 2 || currentStep === 3) && userId && (
            <DynamicStep
              userId={userId}
              stepNumber={currentStep}
              onNext={handleStepNext}
              onBack={handleStepBack}
              initialData={userData}
            />
          )}

          {currentStep === 4 && userId && (
            <CompletionStep
              userId={userId}
              onRestart={handleRestart}
            />
          )}
        </div>
      </div>
    </div>
  );
}
