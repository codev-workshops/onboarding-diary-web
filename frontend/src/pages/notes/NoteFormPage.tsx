import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, Alert, CircularProgress, Chip } from '@mui/material';
import { notesApi } from '../../api/notes';

export default function NoteFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '', content: '', tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      notesApi.getById(id).then((res) => {
        const note = res.data.note;
        setFormData({
          date: new Date(note.date).toISOString().split('T')[0],
          title: note.title, content: note.content, tags: note.tags || [],
        });
      }).catch(() => setError('Failed to load note')).finally(() => setFetchLoading(false));
    }
  }, [id]);

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (isEdit && id) { await notesApi.update(id, formData); }
      else { await notesApi.create(formData); }
      navigate('/notes');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosErr.response?.data?.error?.message || 'Failed to save note');
    } finally { setLoading(false); }
  };

  if (fetchLoading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>{isEdit ? 'Edit Note' : 'New Note'}</Typography>
      <Paper sx={{ p: 3, maxWidth: 600 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField fullWidth label="Date" type="date" value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            margin="normal" required InputLabelProps={{ shrink: true }} />
          <TextField fullWidth label="Title" value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal" required inputProps={{ minLength: 3, maxLength: 200 }} />
          <TextField fullWidth label="Content" value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            margin="normal" required multiline rows={6} />
          <Box sx={{ mt: 1 }}>
            <TextField label="Add Tag" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
              size="small" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
              helperText="Press Enter to add tag" />
            <Button onClick={handleAddTag} sx={{ ml: 1, mt: 0.5 }}>Add</Button>
          </Box>
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {formData.tags.map((tag) => (
              <Chip key={tag} label={tag} onDelete={() => handleRemoveTag(tag)} size="small" />
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/notes')}>Cancel</Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
