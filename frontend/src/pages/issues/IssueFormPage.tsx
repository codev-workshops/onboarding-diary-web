import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, TextField, Button, MenuItem, Paper, Alert, CircularProgress } from '@mui/material';
import { issuesApi } from '../../api/issues';

export default function IssueFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '', description: '', severity: 'medium', status: 'open', resolutionNotes: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      issuesApi.getById(id).then((res) => {
        const issue = res.data.issue;
        setFormData({
          date: new Date(issue.date).toISOString().split('T')[0],
          title: issue.title, description: issue.description,
          severity: issue.severity, status: issue.status, resolutionNotes: issue.resolutionNotes || '',
        });
      }).catch(() => setError('Failed to load issue')).finally(() => setFetchLoading(false));
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (isEdit && id) { await issuesApi.update(id, formData); }
      else { await issuesApi.create(formData); }
      navigate('/issues');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosErr.response?.data?.error?.message || 'Failed to save issue');
    } finally { setLoading(false); }
  };

  if (fetchLoading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>{isEdit ? 'Edit Issue' : 'New Issue'}</Typography>
      <Paper sx={{ p: 3, maxWidth: 600 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField fullWidth label="Date" type="date" value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            margin="normal" required InputLabelProps={{ shrink: true }} />
          <TextField fullWidth label="Title" value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal" required inputProps={{ minLength: 3, maxLength: 200 }} />
          <TextField fullWidth label="Description" value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal" required multiline rows={3} />
          <TextField fullWidth select label="Severity" value={formData.severity}
            onChange={(e) => setFormData({ ...formData, severity: e.target.value })} margin="normal">
            <MenuItem value="low">Low</MenuItem><MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem><MenuItem value="critical">Critical</MenuItem>
          </TextField>
          <TextField fullWidth select label="Status" value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })} margin="normal">
            <MenuItem value="open">Open</MenuItem><MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem><MenuItem value="closed">Closed</MenuItem>
          </TextField>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/issues')}>Cancel</Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
