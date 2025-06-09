'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface BirthdateComponentProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function BirthdateComponent({ value, onChange, error }: BirthdateComponentProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="birthdate">Date of Birth</Label>
      <Input
        id="birthdate"
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-48"
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}