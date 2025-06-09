'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { AboutMeComponent } from './AboutMeComponent';
import { AddressComponent } from './AddressComponent';
import { BirthdateComponent } from './BirthdateComponent';

interface StepData {
  about_me: string;
  street_address: string;
  city: string;
  state: string;
  zip: string;
  birthdate: string;
}

interface DynamicStepProps {
  userId: string;
  stepNumber: number;
  onNext: () => void;
  onBack: () => void;
  initialData: StepData;
}

export function DynamicStep({ userId, stepNumber, onNext, onBack, initialData }: DynamicStepProps) {
  const [components, setComponents] = useState<string[]>([]);
  const [formData, setFormData] = useState<StepData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<StepData>>({});

  useEffect(() => {
    const fetchComponents = async () => {
      const { data } = await supabase
        .from('onboarding_config')
        .select('component_type')
        .eq('page_number', stepNumber);

      if (data) {
        setComponents(data.map(item => item.component_type));
      }
    };

    fetchComponents();
  }, [stepNumber]);

  const validateForm = (): boolean => {
    const newErrors: Partial<StepData> = {};

    components.forEach(component => {
      if (component === 'about_me' && (!formData.about_me || !formData.about_me.trim())) {
        newErrors.about_me = 'About me is required';
      }
      if (component === 'address') {
        if (!formData.street_address || !formData.street_address.trim()) newErrors.street_address = 'Street address is required';
        if (!formData.city || !formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state || !formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.zip || !formData.zip.trim()) newErrors.zip = 'ZIP code is required';
      }
      if (component === 'birthdate' && (!formData.birthdate || !formData.birthdate.trim())) {
        newErrors.birthdate = 'Birthdate is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const updateData: any = {
        current_step: stepNumber,
      };

      components.forEach(component => {
        if (component === 'about_me') updateData.about_me = formData.about_me;
        if (component === 'address') {
          updateData.street_address = formData.street_address;
          updateData.city = formData.city;
          updateData.state = formData.state;
          updateData.zip = formData.zip;
        }
        if (component === 'birthdate') updateData.birthdate = formData.birthdate;
      });

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        console.error('Database error:', error);
        throw new Error('Failed to save your information. Please try again.');
      }

      onNext();
    } catch (err) {
      console.error('Error saving data:', err);
      setErrors({ about_me: 'Failed to save data. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const updateAboutMe = (value: string) => {
    setFormData(prev => ({ ...prev, about_me: value }));
  };

  const updateAddress = (addressData: any) => {
    setFormData(prev => ({ ...prev, ...addressData }));
  };

  const updateBirthdate = (value: string) => {
    setFormData(prev => ({ ...prev, birthdate: value }));
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          Step {stepNumber} of 3
        </CardTitle>
        <p className="text-center text-gray-600">
          Please fill out the information below
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {components.map((component) => (
          <div key={component}>
            {component === 'about_me' && (
              <AboutMeComponent
                value={formData.about_me}
                onChange={updateAboutMe}
                error={errors.about_me}
              />
            )}
            {component === 'address' && (
              <AddressComponent
                value={{
                  street_address: formData.street_address,
                  city: formData.city,
                  state: formData.state,
                  zip: formData.zip,
                }}
                onChange={updateAddress}
                errors={{
                  street_address: errors.street_address,
                  city: errors.city,
                  state: errors.state,
                  zip: errors.zip,
                }}
              />
            )}
            {component === 'birthdate' && (
              <BirthdateComponent
                value={formData.birthdate}
                onChange={updateBirthdate}
                error={errors.birthdate}
              />
            )}
          </div>
        ))}

        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
