'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface AddressData {
  street_address: string;
  city: string;
  state: string;
  zip: string;
}

interface AddressComponentProps {
  value: AddressData;
  onChange: (value: AddressData) => void;
  errors?: Partial<AddressData>;
}

export function AddressComponent({ value, onChange, errors }: AddressComponentProps) {
  const updateField = (field: keyof AddressData, newValue: string) => {
    onChange({ ...value, [field]: newValue });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Address Information</h3>
      
      <div className="space-y-2">
        <Label htmlFor="street_address">Street Address</Label>
        <Input
          id="street_address"
          value={value.street_address}
          onChange={(e) => updateField('street_address', e.target.value)}
          placeholder="123 Main St"
        />
        {errors?.street_address && (
          <p className="text-sm text-red-600">{errors.street_address}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={value.city}
            onChange={(e) => updateField('city', e.target.value)}
            placeholder="City"
          />
          {errors?.city && (
            <p className="text-sm text-red-600">{errors.city}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={value.state}
            onChange={(e) => updateField('state', e.target.value)}
            placeholder="State"
          />
          {errors?.state && (
            <p className="text-sm text-red-600">{errors.state}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="zip">ZIP Code</Label>
        <Input
          id="zip"
          value={value.zip}
          onChange={(e) => updateField('zip', e.target.value)}
          placeholder="12345"
          className="w-32"
        />
        {errors?.zip && (
          <p className="text-sm text-red-600">{errors.zip}</p>
        )}
      </div>
    </div>
  );
}