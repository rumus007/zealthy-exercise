'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AboutMeComponentProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function AboutMeComponent({ value, onChange, error }: AboutMeComponentProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="about_me">About Me</Label>
      <Textarea
        id="about_me"
        placeholder="Tell us about yourself..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="resize-none"
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}