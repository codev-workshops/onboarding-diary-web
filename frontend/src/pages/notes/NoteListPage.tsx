import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton, TextField,
  TablePagination, Alert, CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { notesApi } from '../../api/notes';
import { AdditionalNote } from '../../types';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function NoteListPage() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<AdditionalNote[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page + 1), limit: String(rowsPerPage), sortBy: 'date', sortOrder: 'desc',
      };
      if (search) params.search = search;
      const response = await notesApi.list(params);
      setNotes(response.data.data);
      setTotal(response.data.total);
    } catch { setError('Failed to load notes'); }
    finally { setLoading(false); }
  }, [page, rowsPerPage, search]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await notesApi.delete(deleteId); setDeleteId(null); fetchNotes(); }
    catch { setError('Failed to delete note'); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Additional Notes</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/notes/new')}>New Note</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ mb: 2 }}>
        <TextField label="Search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          size="small" placeholder="Search title or content..." sx={{ minWidth: 300 }} />
      </Box>
      {loading ? <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell><TableCell>Title</TableCell>
                <TableCell>Tags</TableCell><TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notes.map((note) => (
                <TableRow key={note.id} hover>
                  <TableCell>{new Date(note.date).toLocaleDateString()}</TableCell>
                  <TableCell>{note.title}</TableCell>
                  <TableCell>
                    {note.tags?.map((tag) => <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />)}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => navigate(`/notes/${note.id}/edit`)}><Edit /></IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteId(note.id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {notes.length === 0 && <TableRow><TableCell colSpan={4} align="center">No notes found</TableCell></TableRow>}
            </TableBody>
          </Table>
          <TablePagination component="div" count={total} page={page} onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }} />
        </TableContainer>
      )}
      <ConfirmDialog open={!!deleteId} title="Delete Note" message="Are you sure you want to delete this note?"
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} confirmColor="error" confirmText="Delete" />
    </Box>
  );
}
