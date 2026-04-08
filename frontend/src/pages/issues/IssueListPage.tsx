import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton, TextField, MenuItem,
  TablePagination, Alert, CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete, CheckCircle } from '@mui/icons-material';
import { issuesApi } from '../../api/issues';
import { IssueLog } from '../../types';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const statusColors: Record<string, 'default' | 'warning' | 'success' | 'info'> = {
  open: 'warning', in_progress: 'info', resolved: 'success', closed: 'default',
};
const severityColors: Record<string, 'default' | 'warning' | 'error' | 'info'> = {
  low: 'default', medium: 'info', high: 'warning', critical: 'error',
};

export default function IssueListPage() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<IssueLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page + 1), limit: String(rowsPerPage), sortBy: 'date', sortOrder: 'desc',
      };
      if (filterStatus) params.status = filterStatus;
      if (filterSeverity) params.severity = filterSeverity;
      const response = await issuesApi.list(params);
      setIssues(response.data.data);
      setTotal(response.data.total);
    } catch { setError('Failed to load issues'); }
    finally { setLoading(false); }
  }, [page, rowsPerPage, filterStatus, filterSeverity]);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await issuesApi.delete(deleteId); setDeleteId(null); fetchIssues(); }
    catch { setError('Failed to delete issue'); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Issue Log</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/issues/new')}>New Issue</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField select label="Status" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }} size="small" sx={{ minWidth: 150 }}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="open">Open</MenuItem>
          <MenuItem value="in_progress">In Progress</MenuItem>
          <MenuItem value="resolved">Resolved</MenuItem>
          <MenuItem value="closed">Closed</MenuItem>
        </TextField>
        <TextField select label="Severity" value={filterSeverity} onChange={(e) => { setFilterSeverity(e.target.value); setPage(0); }} size="small" sx={{ minWidth: 150 }}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="low">Low</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="high">High</MenuItem>
          <MenuItem value="critical">Critical</MenuItem>
        </TextField>
      </Box>
      {loading ? <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell><TableCell>Title</TableCell><TableCell>Severity</TableCell>
                <TableCell>Status</TableCell><TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {issues.map((issue) => (
                <TableRow key={issue.id} hover>
                  <TableCell>{new Date(issue.date).toLocaleDateString()}</TableCell>
                  <TableCell>{issue.title}</TableCell>
                  <TableCell><Chip label={issue.severity} size="small" color={severityColors[issue.severity]} /></TableCell>
                  <TableCell><Chip label={issue.status.replace('_', ' ')} size="small" color={statusColors[issue.status]} /></TableCell>
                  <TableCell align="right">
                    {issue.status !== 'resolved' && issue.status !== 'closed' && (
                      <IconButton size="small" color="success" onClick={() => navigate(`/issues/${issue.id}/resolve`)}><CheckCircle /></IconButton>
                    )}
                    <IconButton size="small" onClick={() => navigate(`/issues/${issue.id}/edit`)}><Edit /></IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteId(issue.id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {issues.length === 0 && <TableRow><TableCell colSpan={5} align="center">No issues found</TableCell></TableRow>}
            </TableBody>
          </Table>
          <TablePagination component="div" count={total} page={page} onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }} />
        </TableContainer>
      )}
      <ConfirmDialog open={!!deleteId} title="Delete Issue" message="Are you sure you want to delete this issue?"
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} confirmColor="error" confirmText="Delete" />
    </Box>
  );
}
