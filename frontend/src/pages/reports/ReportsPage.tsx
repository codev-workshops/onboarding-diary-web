import { useState } from 'react';
import {
  Box, Typography, TextField, Button, MenuItem, Paper, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Tabs, Tab,
} from '@mui/material';
import { Download } from '@mui/icons-material';
import { reportsApi } from '../../api/reports';
import type { ReportData } from '../../types';

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [categories, setCategories] = useState('tasks,issues,feedback,notes');
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('tasks');

  const handleGenerate = async () => {
    if (!dateFrom || !dateTo) { setError('Please select date range'); return; }
    setError(''); setLoading(true);
    try {
      const params = { dateFrom, dateTo, categories };
      const res = await reportsApi.generate(params);
      setReport(res.data.report);
    } catch { setError('Failed to generate report'); }
    finally { setLoading(false); }
  };

  const handleDownloadCsv = async () => {
    if (!dateFrom || !dateTo) return;
    try {
      const res = await reportsApi.downloadCsv({ dateFrom, dateTo, categories });
      const url = window.URL.createObjectURL(new Blob([res.data as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${dateFrom}-to-${dateTo}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch { setError('Failed to download CSV'); }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Reports</Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField label="From" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            size="small" InputLabelProps={{ shrink: true }} />
          <TextField label="To" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            size="small" InputLabelProps={{ shrink: true }} />
          <TextField select label="Categories" value={categories} onChange={(e) => setCategories(e.target.value)}
            size="small" sx={{ minWidth: 200 }}>
            <MenuItem value="tasks,issues,feedback,notes">All</MenuItem>
            <MenuItem value="tasks">Tasks Only</MenuItem>
            <MenuItem value="issues">Issues Only</MenuItem>
            <MenuItem value="feedback">Feedback Only</MenuItem>
            <MenuItem value="notes">Notes Only</MenuItem>
          </TextField>
          <Button variant="contained" onClick={handleGenerate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
          {report && (
            <Button variant="outlined" startIcon={<Download />} onClick={handleDownloadCsv}>
              Download CSV
            </Button>
          )}
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}

      {report && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Report: {new Date(report.dateRange.from).toLocaleDateString()} - {new Date(report.dateRange.to).toLocaleDateString()}
          </Typography>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            {report.tasks && <Tab value="tasks" label={`Tasks (${report.tasks.length})`} />}
            {report.issues && <Tab value="issues" label={`Issues (${report.issues.length})`} />}
            {report.feedback && <Tab value="feedback" label={`Feedback (${report.feedback.length})`} />}
            {report.notes && <Tab value="notes" label={`Notes (${report.notes.length})`} />}
          </Tabs>

          {tab === 'tasks' && report.tasks && (
            <TableContainer>
              <Table size="small">
                <TableHead><TableRow>
                  <TableCell>Date</TableCell><TableCell>Title</TableCell><TableCell>Category</TableCell>
                  <TableCell>Status</TableCell><TableCell>Priority</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {report.tasks.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                      <TableCell>{t.title}</TableCell><TableCell>{t.category}</TableCell>
                      <TableCell>{t.status}</TableCell><TableCell>{t.priority}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {tab === 'issues' && report.issues && (
            <TableContainer>
              <Table size="small">
                <TableHead><TableRow>
                  <TableCell>Date</TableCell><TableCell>Title</TableCell>
                  <TableCell>Severity</TableCell><TableCell>Status</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {report.issues.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell>{new Date(i.date).toLocaleDateString()}</TableCell>
                      <TableCell>{i.title}</TableCell><TableCell>{i.severity}</TableCell>
                      <TableCell>{i.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {tab === 'feedback' && report.feedback && (
            <TableContainer>
              <Table size="small">
                <TableHead><TableRow>
                  <TableCell>Date</TableCell><TableCell>Subject</TableCell><TableCell>Type</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {report.feedback.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>{new Date(f.date).toLocaleDateString()}</TableCell>
                      <TableCell>{f.subject}</TableCell><TableCell>{f.type}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {tab === 'notes' && report.notes && (
            <TableContainer>
              <Table size="small">
                <TableHead><TableRow>
                  <TableCell>Date</TableCell><TableCell>Title</TableCell><TableCell>Tags</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {report.notes.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell>{new Date(n.date).toLocaleDateString()}</TableCell>
                      <TableCell>{n.title}</TableCell><TableCell>{n.tags?.join(', ')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}
    </Box>
  );
}
