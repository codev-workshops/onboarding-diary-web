import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton, TextField, MenuItem,
  TablePagination, Alert, CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete, Block, CheckCircle } from '@mui/icons-material';
import { adminApi } from '../../api/admin';
import { User } from '../../types';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function UserListPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [filterRole, setFilterRole] = useState('');
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page + 1), limit: String(rowsPerPage),
      };
      if (filterRole) params.role = filterRole;
      if (search) params.search = search;
      const response = await adminApi.listUsers(params);
      setUsers(response.data.data);
      setTotal(response.data.total);
    } catch { setError('Failed to load users'); }
    finally { setLoading(false); }
  }, [page, rowsPerPage, filterRole, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async () => {
    if (!deleteUser) return;
    try { await adminApi.deleteUser(deleteUser.id, deleteUser.email); setDeleteUser(null); fetchUsers(); }
    catch { setError('Failed to delete user'); }
  };

  const handleToggleActive = async (user: User) => {
    try {
      if (user.isActive) { await adminApi.deactivateUser(user.id); }
      else { await adminApi.activateUser(user.id); }
      fetchUsers();
    } catch { setError('Failed to update user status'); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">User Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/admin/users/new')}>New User</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField label="Search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          size="small" placeholder="Search by name or email..." sx={{ minWidth: 250 }} />
        <TextField select label="Role" value={filterRole} onChange={(e) => { setFilterRole(e.target.value); setPage(0); }}
          size="small" sx={{ minWidth: 150 }}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="recruit">Recruit</MenuItem>
          <MenuItem value="manager">Manager</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
        </TextField>
      </Box>
      {loading ? <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Role</TableCell>
                <TableCell>Department</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>{u.name}</TableCell><TableCell>{u.email}</TableCell>
                  <TableCell><Chip label={u.role} size="small" /></TableCell>
                  <TableCell>{u.department || '-'}</TableCell>
                  <TableCell><Chip label={u.isActive ? 'Active' : 'Inactive'} size="small"
                    color={u.isActive ? 'success' : 'default'} /></TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleToggleActive(u)}
                      color={u.isActive ? 'warning' : 'success'}>
                      {u.isActive ? <Block /> : <CheckCircle />}
                    </IconButton>
                    <IconButton size="small" onClick={() => navigate(`/admin/users/${u.id}/edit`)}><Edit /></IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteUser(u)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && <TableRow><TableCell colSpan={6} align="center">No users found</TableCell></TableRow>}
            </TableBody>
          </Table>
          <TablePagination component="div" count={total} page={page} onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }} />
        </TableContainer>
      )}
      <ConfirmDialog open={!!deleteUser} title="Delete User"
        message={`Are you sure you want to permanently delete ${deleteUser?.name}? This action cannot be undone.`}
        onConfirm={handleDelete} onCancel={() => setDeleteUser(null)} confirmColor="error" confirmText="Delete" />
    </Box>
  );
}
