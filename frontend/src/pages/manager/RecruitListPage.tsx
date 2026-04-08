import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton, Alert, CircularProgress,
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { managerApi } from '../../api/manager';
import { User } from '../../types';

export default function RecruitListPage() {
  const navigate = useNavigate();
  const [recruits, setRecruits] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    managerApi.listRecruits()
      .then((res) => setRecruits(res.data.recruits || res.data.data || []))
      .catch(() => setError('Failed to load recruits'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>My Recruits</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell><TableCell>Email</TableCell>
              <TableCell>Department</TableCell><TableCell>Start Date</TableCell>
              <TableCell>Status</TableCell><TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recruits.map((recruit) => (
              <TableRow key={recruit.id} hover>
                <TableCell>{recruit.name}</TableCell>
                <TableCell>{recruit.email}</TableCell>
                <TableCell>{recruit.department || '-'}</TableCell>
                <TableCell>{recruit.startDate ? new Date(recruit.startDate).toLocaleDateString() : '-'}</TableCell>
                <TableCell><Chip label={recruit.isActive ? 'Active' : 'Inactive'} size="small"
                  color={recruit.isActive ? 'success' : 'default'} /></TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => navigate(`/manager/recruits/${recruit.id}`)}>
                    <Visibility />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {recruits.length === 0 && <TableRow><TableCell colSpan={6} align="center">No recruits assigned</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
