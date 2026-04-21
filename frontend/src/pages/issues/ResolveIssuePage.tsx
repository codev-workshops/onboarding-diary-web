import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, Alert } from '@mui/material';
import { issuesApi } from '../../api/issues';

export default function ResolveIssuePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError(''); setLoading(true);
    try {
      await issuesApi.resolve(id, resolutionNotes);
      navigate('/issues');
    } catch {
      setError('Failed to resolve issue');
    } finally { setLoading(false); }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Resolve Issue</Typography>
      <Paper sx={{ p: 3, maxWidth: 600 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField fullWidth label="Resolution Notes" value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            margin="normal" required multiline rows={4}
            helperText="Describe how the issue was resolved" />
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button type="submit" variant="contained" color="success" disabled={loading}>
              {loading ? 'Resolving...' : 'Mark as Resolved'}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/issues')}>Cancel</Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
