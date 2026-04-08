import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton, TextField, MenuItem,
  TablePagination, Alert, CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { feedbackApi } from '../../api/feedback';
import { FeedbackNote } from '../../types';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const typeColors: Record<string, 'success' | 'info' | 'warning'> = {
  positive: 'success', suggestion: 'info', concern: 'warning',
};

export default function FeedbackListPage() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState<FeedbackNote[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('');

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page + 1), limit: String(rowsPerPage), sortBy: 'date', sortOrder: 'desc',
      };
      if (filterType) params.type = filterType;
      const response = await feedbackApi.list(params);
      setFeedbacks(response.data.data);
      setTotal(response.data.total);
    } catch { setError('Failed to load feedback'); }
    finally { setLoading(false); }
  }, [page, rowsPerPage, filterType]);

  useEffect(() => { fetchFeedback(); }, [fetchFeedback]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await feedbackApi.delete(deleteId); setDeleteId(null); fetchFeedback(); }
    catch { setError('Failed to delete feedback'); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Feedback Notes</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/feedback/new')}>New Feedback</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField select label="Type" value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(0); }} size="small" sx={{ minWidth: 150 }}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="positive">Positive</MenuItem>
          <MenuItem value="suggestion">Suggestion</MenuItem>
          <MenuItem value="concern">Concern</MenuItem>
        </TextField>
      </Box>
      {loading ? <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell><TableCell>Subject</TableCell>
                <TableCell>Type</TableCell><TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feedbacks.map((fb) => (
                <TableRow key={fb.id} hover>
                  <TableCell>{new Date(fb.date).toLocaleDateString()}</TableCell>
                  <TableCell>{fb.subject}</TableCell>
                  <TableCell><Chip label={fb.type} size="small" color={typeColors[fb.type]} /></TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => navigate(`/feedback/${fb.id}/edit`)}><Edit /></IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteId(fb.id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {feedbacks.length === 0 && <TableRow><TableCell colSpan={4} align="center">No feedback found</TableCell></TableRow>}
            </TableBody>
          </Table>
          <TablePagination component="div" count={total} page={page} onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }} />
        </TableContainer>
      )}
      <ConfirmDialog open={!!deleteId} title="Delete Feedback" message="Are you sure you want to delete this feedback?"
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} confirmColor="error" confirmText="Delete" />
    </Box>
  );
}
