import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { tasksApi } from '../../api/tasks';

export default function TaskFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    description: '',
    category: 'other',
    status: 'not_started',
    priority: 'medium',
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      tasksApi.getById(id).then((res) => {
        const task = res.data.task;
        setFormData({
          date: new Date(task.date).toISOString().split('T')[0],
          title: task.title,
          description: task.description || '',
          category: task.category,
          status: task.status,
          priority: task.priority,
        });
      }).catch(() => setError('Failed to load task'))
        .finally(() => setFetchLoading(false));
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit && id) {
        await tasksApi.update(id, formData);
      } else {
        await tasksApi.create(formData);
      }
      navigate('/tasks');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosErr.response?.data?.error?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>{isEdit ? 'Edit Task' : 'New Task'}</Typography>
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
            margin="normal" multiline rows={3} />
          <TextField fullWidth select label="Category" value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })} margin="normal">
            <MenuItem value="learning">Learning</MenuItem>
            <MenuItem value="setup">Setup</MenuItem>
            <MenuItem value="meeting">Meeting</MenuItem>
            <MenuItem value="coding">Coding</MenuItem>
            <MenuItem value="documentation">Documentation</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>
          <TextField fullWidth select label="Status" value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })} margin="normal">
            <MenuItem value="not_started">Not Started</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="deferred">Deferred</MenuItem>
          </TextField>
          <TextField fullWidth select label="Priority" value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })} margin="normal">
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="urgent">Urgent</MenuItem>
          </TextField>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/tasks')}>Cancel</Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
