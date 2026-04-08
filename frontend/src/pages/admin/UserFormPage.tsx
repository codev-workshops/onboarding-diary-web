import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, TextField, Button, MenuItem, Paper, Alert, CircularProgress } from '@mui/material';
import { adminApi } from '../../api/admin';

export default function UserFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    email: '', password: '', name: '', role: 'recruit',
    department: '', startDate: '', managerId: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      adminApi.getUserById(id).then((res) => {
        const user = res.data.user;
        setFormData({
          email: user.email, password: '', name: user.name, role: user.role,
          department: user.department || '',
          startDate: user.startDate ? new Date(user.startDate).toISOString().split('T')[0] : '',
          managerId: user.managerId || '',
        });
      }).catch(() => setError('Failed to load user')).finally(() => setFetchLoading(false));
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data: Record<string, unknown> = { ...formData };
      if (!data.password) delete data.password;
      if (!data.managerId) delete data.managerId;
      if (!data.startDate) delete data.startDate;

      if (isEdit && id) { await adminApi.updateUser(id, data); }
      else { await adminApi.createUser(data); }
      navigate('/admin/users');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosErr.response?.data?.error?.message || 'Failed to save user');
    } finally { setLoading(false); }
  };

  if (fetchLoading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>{isEdit ? 'Edit User' : 'Create User'}</Typography>
      <Paper sx={{ p: 3, maxWidth: 600 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField fullWidth label="Email" type="email" value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            margin="normal" required disabled={isEdit} />
          <TextField fullWidth label={isEdit ? 'New Password (leave blank to keep)' : 'Password'}
            type="password" value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            margin="normal" required={!isEdit}
            helperText="Min 8 chars, uppercase, lowercase, number, special char" />
          <TextField fullWidth label="Name" value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal" required />
          <TextField fullWidth select label="Role" value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })} margin="normal">
            <MenuItem value="recruit">Recruit</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
          <TextField fullWidth label="Department" value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })} margin="normal" />
          <TextField fullWidth label="Start Date" type="date" value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            margin="normal" InputLabelProps={{ shrink: true }} />
          <TextField fullWidth label="Manager ID (optional)" value={formData.managerId}
            onChange={(e) => setFormData({ ...formData, managerId: e.target.value })} margin="normal" />
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/admin/users')}>Cancel</Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
