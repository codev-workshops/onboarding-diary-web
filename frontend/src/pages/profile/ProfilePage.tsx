import { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Paper, Alert, CircularProgress, Divider,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { profileApi } from '../../api/profile';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState({ name: '', department: '', startDate: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '', department: user.department || '',
        startDate: user.startDate ? new Date(user.startDate).toISOString().split('T')[0] : '',
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const res = await profileApi.updateProfile(profileData);
      updateUser(res.data.user);
      setSuccess('Profile updated successfully');
    } catch { setError('Failed to update profile'); }
    finally { setLoading(false); }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(''); setPwSuccess('');
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPwError('Passwords do not match'); return;
    }
    setPwLoading(true);
    try {
      await profileApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPwSuccess('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch { setPwError('Failed to change password'); }
    finally { setPwLoading(false); }
  };

  if (!user) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Profile</Typography>

      <Paper sx={{ p: 3, mb: 3, maxWidth: 600 }}>
        <Typography variant="h6" gutterBottom>Personal Information</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <Box component="form" onSubmit={handleProfileSubmit}>
          <TextField fullWidth label="Email" value={user.email} disabled margin="normal" />
          <TextField fullWidth label="Role" value={user.role} disabled margin="normal" />
          <TextField fullWidth label="Name" value={profileData.name}
            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            margin="normal" required />
          <TextField fullWidth label="Department" value={profileData.department}
            onChange={(e) => setProfileData({ ...profileData, department: e.target.value })} margin="normal" />
          <TextField fullWidth label="Start Date" type="date" value={profileData.startDate}
            onChange={(e) => setProfileData({ ...profileData, startDate: e.target.value })}
            margin="normal" InputLabelProps={{ shrink: true }} />
          <Button type="submit" variant="contained" disabled={loading} sx={{ mt: 2 }}>
            {loading ? 'Saving...' : 'Update Profile'}
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Typography variant="h6" gutterBottom>Change Password</Typography>
        <Divider sx={{ mb: 2 }} />
        {pwError && <Alert severity="error" sx={{ mb: 2 }}>{pwError}</Alert>}
        {pwSuccess && <Alert severity="success" sx={{ mb: 2 }}>{pwSuccess}</Alert>}
        <Box component="form" onSubmit={handlePasswordSubmit}>
          <TextField fullWidth label="Current Password" type="password" value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            margin="normal" required />
          <TextField fullWidth label="New Password" type="password" value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            margin="normal" required helperText="Min 8 chars, uppercase, lowercase, number, special char" />
          <TextField fullWidth label="Confirm New Password" type="password" value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            margin="normal" required />
          <Button type="submit" variant="contained" disabled={pwLoading} sx={{ mt: 2 }}>
            {pwLoading ? 'Changing...' : 'Change Password'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
