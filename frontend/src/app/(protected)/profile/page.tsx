'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  User,
  Mail,
  Calendar,
  Edit,
  Save,
  X,
  Shield,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { normalizeRole } from '@/lib/utils/constants';
import { toast } from 'sonner';
import { updateUserProfile } from '@/lib/api/users';

export const dynamic = 'force-dynamic';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
}

export default function ProfilePage() {
  const { user, refreshAuth, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
      });
      setErrors({});
    }
  }, [user]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProfileFormData, string>> = {};
    if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
    const email = formData.email?.trim() || '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) newErrors.email = 'Email is required';
    else if (!emailRegex.test(email)) newErrors.email = 'Please enter a valid email address';
    if (formData.phoneNumber && formData.phoneNumber.length > 30) newErrors.phoneNumber = 'Phone number is too long';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    try {
      setSaving(true);
      const updated = await updateUserProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        // Email is not updatable from the UI/backend
        phoneNumber: formData.phoneNumber,
        address: formData.address,
      });
      // Immediately reflect latest user details
      setUser(updated);
      setFormData({
        firstName: updated.firstName || '',
        lastName: updated.lastName || '',
        email: updated.email || formData.email,
        phoneNumber: updated.phoneNumber || '',
        address: updated.address || '',
      });
      // Also refresh auth cache (tokens/user) if applicable
      await refreshAuth?.();
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update profile';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
      });
    }
    setIsEditing(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="h-4 w-4" />;
      case 'INSTRUCTOR':
        return <Briefcase className="h-4 w-4" />;
      case 'STUDENT':
        return <GraduationCap className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'INSTRUCTOR':
        return 'bg-blue-100 text-blue-800';
      case 'STUDENT':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 data-testid="profile-heading" className="text-3xl font-bold tracking-tight text-gray-900">
              Profile Settings
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your personal information and account settings.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Profile Overview */}
            <Card className="lg:col-span-1">
              <CardHeader className="text-center">
                <div className="mx-auto h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-gray-500" />
                </div>
                <CardTitle className="text-xl" data-testid="profile-user-name">
                  {user?.firstName} {user?.lastName}
                </CardTitle>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  {user?.role && (
                    <Badge className={getRoleColor(user.role)}>
                      <div className="flex items-center space-x-1">
                        {getRoleIcon(user.role)}
                        <span>{user.role}</span>
                      </div>
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600" data-testid="profile-user-email">{user?.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear()}
                    </span>
                  </div>
                  {user?.studentId && (
                    <div className="flex items-center space-x-3 text-sm">
                      <GraduationCap className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">ID: {user.studentId}</span>
                    </div>
                  )}
                  {user?.employeeId && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">ID: {user.employeeId}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Profile Details */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                {!isEditing ? (
                  <Button
                    data-testid="button-edit"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      data-testid="button-cancel"
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      data-testid="button-save"
                      size="sm"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                      {isEditing ? (
                      <Input
                        name="firstName"
                        data-testid="input-firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="Enter first name"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                        {user?.firstName || 'Not provided'}
                      </p>
                    )}
                    {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    {isEditing ? (
                      <Input
                        name="lastName"
                        data-testid="input-lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Enter last name"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                        {user?.lastName || 'Not provided'}
                      </p>
                    )}
                    {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    {isEditing ? (
                    <>
                      <Input
                        name="email"
                        data-testid="input-email"
                        type="email"
                        value={formData.email}
                        disabled
                        placeholder="Email cannot be changed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
                    </>
                  ) : (
                      <p className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                        {user?.email || 'Not provided'}
                      </p>
                    )}
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <Input
                        name="phoneNumber"
                        data-testid="input-phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                        {formData.phoneNumber || 'Not provided'}
                      </p>
                    )}
                    {errors.phoneNumber && <p className="text-xs text-red-600 mt-1">{errors.phoneNumber}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  {isEditing ? (
                    <Input
                      name="address"
                      data-testid="input-address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Enter address"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                      {formData.address || 'Not provided'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <p className="text-sm text-gray-900 py-2 px-3 bg-gray-100 rounded-md">
                    {user?.username || 'Not provided'}
                    <span className="text-xs text-gray-500 ml-2">(Cannot be changed)</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <div className="py-2">
                    {user?.role && (
                      <Badge className={getRoleColor(user.role)}>
                        <div className="flex items-center space-x-1">
                          {getRoleIcon(normalizeRole(user.role) || user.role)}
                          <span>{normalizeRole(user.role) || user.role}</span>
                        </div>
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500 ml-2">(Cannot be changed)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Security */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Password</h4>
                    <p className="text-sm text-gray-600">
                      Last updated: Never
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change Password
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable 2FA
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
