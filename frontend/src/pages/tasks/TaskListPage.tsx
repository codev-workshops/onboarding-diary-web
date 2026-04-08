import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  TablePagination,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { tasksApi } from '../../api/tasks';
import { TaskLog } from '../../types';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const statusColors: Record<string, 'default' | 'primary' | 'success' | 'warning'> = {
  not_started: 'default',
  in_progress: 'primary',
  completed: 'success',
  deferred: 'warning',
};

const priorityColors: Record<string, 'default' | 'warning' | 'error' | 'info'> = {
  low: 'default',
  medium: 'info',
  high: 'warning',
  urgent: 'error',
};

export default function TaskListPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TaskLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page + 1),
        limit: String(rowsPerPage),
        sortBy: 'date',
        sortOrder: 'desc',
      };
      if (filterStatus) params.status = filterStatus;
      if (filterCategory) params.category = filterCategory;

      const response = await tasksApi.list(params);
      setTasks(response.data.data);
      setTotal(response.data.total);
    } catch {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filterStatus, filterCategory]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await tasksApi.delete(deleteId);
      setDeleteId(null);
      fetchTasks();
    } catch {
      setError('Failed to delete task');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Task Log</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/tasks/new')}>
          New Task
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          select
          label="Status"
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="not_started">Not Started</MenuItem>
          <MenuItem value="in_progress">In Progress</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="deferred">Deferred</MenuItem>
        </TextField>
        <TextField
          select
          label="Category"
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setPage(0); }}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="learning">Learning</MenuItem>
          <MenuItem value="setup">Setup</MenuItem>
          <MenuItem value="meeting">Meeting</MenuItem>
          <MenuItem value="coding">Coding</MenuItem>
          <MenuItem value="documentation">Documentation</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </TextField>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id} hover>
                  <TableCell>{new Date(task.date).toLocaleDateString()}</TableCell>
                  <TableCell>{task.title}</TableCell>
                  <TableCell><Chip label={task.category} size="small" /></TableCell>
                  <TableCell><Chip label={task.status.replace('_', ' ')} size="small" color={statusColors[task.status]} /></TableCell>
                  <TableCell><Chip label={task.priority} size="small" color={priorityColors[task.priority]} /></TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => navigate(`/tasks/${task.id}/edit`)}><Edit /></IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteId(task.id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {tasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">No tasks found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
          />
        </TableContainer>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmColor="error"
        confirmText="Delete"
      />
    </Box>
  );
}
