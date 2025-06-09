'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Database, RefreshCw, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface UserData {
  id: string;
  email: string;
  about_me: string | null;
  street_address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  birthdate: string | null;
  current_step: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export default function DataPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const formatBirthdate = (dateString: string | null) => {
    if (!dateString) return '—';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getStatusBadge = (user: UserData) => {
    if (user.completed) {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    }
    return <Badge variant="secondary">Step {user.current_step} of 3</Badge>;
  };

  const formatAddress = (user: UserData) => {
    const parts = [
      user.street_address,
      user.city,
      user.state,
      user.zip
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : '—';
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
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Database className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              User Data
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            View all user onboarding data from the database
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>User Database</CardTitle>
                <Badge variant="outline">{users.length} users</Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users yet</h3>
                <p className="text-gray-600">
                  Users will appear here as they complete the onboarding flow.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>About Me</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Birthdate</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{getStatusBadge(user)}</TableCell>
                        <TableCell className="max-w-xs">
                          {user.about_me ? (
                            <div className="truncate\" title={user.about_me}>
                              {user.about_me}
                            </div>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={formatAddress(user)}>
                            {formatAddress(user)}
                          </div>
                        </TableCell>
                        <TableCell>{formatBirthdate(user.birthdate)}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(user.created_at)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(user.updated_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center space-x-4">
          <Button variant="outline" asChild>
            <a href="/">← Back to Onboarding</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/admin">Admin Configuration</a>
          </Button>
        </div>
      </div>
    </div>
  );
}