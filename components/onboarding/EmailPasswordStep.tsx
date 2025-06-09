'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  // Only require password confirmation for new users (we'll handle this in the component)
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

interface EmailPasswordStepProps {
  onNext: (userId: string) => void;
  userId?: string;
  initialData?: { email: string };
}

export function EmailPasswordStep({ onNext, userId, initialData }: EmailPasswordStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExistingUser, setIsExistingUser] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  });

  const checkEmailExists = async (email: string) => {
    if (!email || !z.string().email().safeParse(email).success) return;

    setCheckingEmail(true);
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      setIsExistingUser(!!existingUser);
    } catch (err) {
      setIsExistingUser(false);
    } finally {
      setCheckingEmail(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, current_step, password_hash')
        .eq('email', data.email)
        .single();

      if (existingUser) {
        // User exists - verify password
        const isPasswordValid = await bcrypt.compare(data.password, existingUser.password_hash);

        if (!isPasswordValid) {
          setError('Incorrect password. Please try again.');
          return;
        }

        // Password is correct, proceed to their current step
        onNext(existingUser.id);
      } else {
        // New user - validate password confirmation if needed
        if (isExistingUser === false && data.confirmPassword !== data.password) {
          setError("Passwords don't match");
          return;
        }

        // Hash password and create new user
        const hashedPassword = await bcrypt.hash(data.password, 10);

        const { data: newUser, error } = await supabase
          .from('users')
          .insert({
            email: data.email,
            password_hash: hashedPassword,
            current_step: 1,
          })
          .select('id')
          .single();

        if (error) {
          if (error.code === '23505') { // Unique constraint violation
            setError('An account with this email already exists. Please try signing in.');
          } else {
            throw error;
          }
          return;
        }

        onNext(newUser.id);
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Welcome</CardTitle>
        <p className="text-center text-gray-600">
          {isExistingUser === true
            ? 'Welcome back! Please enter your password.'
            : isExistingUser === false
            ? 'Create your account to get started'
            : 'Enter your email and password to get started'
          }
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              disabled={isLoading}
              onBlur={(e) => checkEmailExists(e.target.value)}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
            {checkingEmail && (
              <p className="text-sm text-gray-500">Checking email...</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {isExistingUser === true ? 'Password' : 'Password (min 6 characters)'}
            </Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {isExistingUser === false && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || checkingEmail}
          >
            {isLoading
              ? 'Please wait...'
              : isExistingUser === true
              ? 'Sign In'
              : 'Create Account'
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
