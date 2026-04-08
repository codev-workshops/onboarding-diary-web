import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, TextField, Button, MenuItem, Paper, Alert, CircularProgress } from '@mui/material';
import { feedbackApi } from '../../api/feedback';

export default function FeedbackFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    subject: '', type: 'positive', details: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      feedbackApi.getById(id).then((res) => {
        const fb = res.data.feedback;
        setFormData({
          date: new Date(fb.date).toISOString().split('T')[0],
          subject: fb.subject, type: fb.type, details: fb.details,
        });
      }).catch(() => setError('Failed to load feedback')).finally(() => setFetchLoading(false));
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (isEdit && id) { await feedbackApi.update(id, formData); }
      else { await feedbackApi.create(formData); }
      navigate('/feedback');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosErr.response?.data?.error?.message || 'Failed to save feedback');
    } finally { setLoading(false); }
  };

  if (fetchLoading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>{isEdit ? 'Edit Feedback' : 'New Feedback'}</Typography>
      <Paper sx={{ p: 3, maxWidth: 600 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField fullWidth label="Date" type="date" value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            margin="normal" required InputLabelProps={{ shrink: true }} />
          <TextField fullWidth label="Subject" value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            margin="normal" required inputProps={{ minLength: 3, maxLength: 200 }} />
          <TextField fullWidth select label="Type" value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })} margin="normal">
            <MenuItem value="positive">Positive</MenuItem>
            <MenuItem value="suggestion">Suggestion</MenuItem>
            <MenuItem value="concern">Concern</MenuItem>
          </TextField>
          <TextField fullWidth label="Details" value={formData.details}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            margin="normal" required multiline rows={4} inputProps={{ minLength: 10 }} />
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/feedback')}>Cancel</Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
