'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ComponentConfig {
  component_type: string;
  page_number: number;
}

const COMPONENT_LABELS = {
  about_me: 'About Me',
  address: 'Address Information',
  birthdate: 'Birth Date',
};

export default function AdminPage() {
  const [config, setConfig] = useState<ComponentConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('onboarding_config')
        .select('*')
        .order('component_type');

      if (error) throw error;

      setConfig(data || []);
    } catch (err) {
      console.error('Error loading config:', err);
      setMessage({ type: 'error', text: 'Failed to load configuration' });
    } finally {
      setIsLoading(false);
    }
  };

  const updateComponentPage = (componentType: string, pageNumber: number) => {
    setConfig(prev => 
      prev.map(item => 
        item.component_type === componentType 
          ? { ...item, page_number: pageNumber }
          : item
      )
    );
  };

  const saveConfig = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      // Validate that each page has at least one component
      const page2Components = config.filter(c => c.page_number === 2);
      const page3Components = config.filter(c => c.page_number === 3);

      if (page2Components.length === 0 || page3Components.length === 0) {
        throw new Error('Each page must have at least one component');
      }

      // Update all configurations
      for (const item of config) {
        const { error } = await supabase
          .from('onboarding_config')
          .update({ page_number: item.page_number })
          .eq('component_type', item.component_type);

        if (error) throw error;
      }

      setMessage({ type: 'success', text: 'Configuration saved successfully!' });
    } catch (err) {
      console.error('Error saving config:', err);
      setMessage({ 
        type: 'error', 
        text: err instanceof Error ? err.message : 'Failed to save configuration' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = async () => {
    const defaultConfig = [
      { component_type: 'about_me', page_number: 2 },
      { component_type: 'address', page_number: 2 },
      { component_type: 'birthdate', page_number: 3 },
    ];

    setConfig(defaultConfig);
  };

  const getPageComponents = (pageNumber: number) => {
    return config.filter(c => c.page_number === pageNumber);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Settings className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Admin Configuration
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Configure which components appear on each onboarding page
          </p>
        </div>

        <div className="grid gap-8">
          {/* Configuration Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Component Configuration</CardTitle>
              <p className="text-sm text-gray-600">
                Assign each component to either page 2 or page 3. Each page must have at least one component.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {config.map((item) => (
                  <div key={item.component_type} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base font-medium">
                        {COMPONENT_LABELS[item.component_type as keyof typeof COMPONENT_LABELS]}
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.component_type === 'about_me' && 'Large text area for user biography'}
                        {item.component_type === 'address' && 'Street address, city, state, and ZIP fields'}
                        {item.component_type === 'birthdate' && 'Date picker for birth date'}
                      </p>
                    </div>
                    <Select
                      value={item.page_number.toString()}
                      onValueChange={(value) => updateComponentPage(item.component_type, parseInt(value))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">Page 2</SelectItem>
                        <SelectItem value="3">Page 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-6">
                <Button onClick={saveConfig} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Configuration'}
                </Button>
                <Button variant="outline" onClick={resetToDefaults}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
              </div>

              {message && (
                <div className={`mt-4 p-3 rounded-md ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {message.text}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Page 2 Preview
                  <Badge variant="secondary">{getPageComponents(2).length} components</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {getPageComponents(2).map((item) => (
                    <div key={item.component_type} className="p-3 bg-blue-50 rounded-md">
                      <span className="font-medium">
                        {COMPONENT_LABELS[item.component_type as keyof typeof COMPONENT_LABELS]}
                      </span>
                    </div>
                  ))}
                  {getPageComponents(2).length === 0 && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-md">
                      ⚠️ Page 2 must have at least one component
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Page 3 Preview
                  <Badge variant="secondary">{getPageComponents(3).length} components</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {getPageComponents(3).map((item) => (
                    <div key={item.component_type} className="p-3 bg-green-50 rounded-md">
                      <span className="font-medium">
                        {COMPONENT_LABELS[item.component_type as keyof typeof COMPONENT_LABELS]}
                      </span>
                    </div>
                  ))}
                  {getPageComponents(3).length === 0 && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-md">
                      ⚠️ Page 3 must have at least one component
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <a href="/">← Back to Onboarding</a>
          </Button>
        </div>
      </div>
    </div>
  );
}