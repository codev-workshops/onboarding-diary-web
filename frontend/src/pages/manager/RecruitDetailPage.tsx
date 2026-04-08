import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Tabs, Tab, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Alert, CircularProgress,
} from '@mui/material';
import { managerApi } from '../../api/manager';
import { TaskLog, IssueLog, FeedbackNote, AdditionalNote } from '../../types';

export default function RecruitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState(0);
  const [tasks, setTasks] = useState<TaskLog[]>([]);
  const [issues, setIssues] = useState<IssueLog[]>([]);
  const [feedback, setFeedback] = useState<FeedbackNote[]>([]);
  const [notes, setNotes] = useState<AdditionalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const [tasksRes, issuesRes, feedbackRes, notesRes] = await Promise.all([
          managerApi.getRecruitTasks(id),
          managerApi.getRecruitIssues(id),
          managerApi.getRecruitFeedback(id),
          managerApi.getRecruitNotes(id),
        ]);
        setTasks(tasksRes.data.data);
        setIssues(issuesRes.data.data);
        setFeedback(feedbackRes.data.data);
        setNotes(notesRes.data.data);
      } catch { setError('Failed to load recruit data'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Recruit Details</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={`Tasks (${tasks.length})`} />
        <Tab label={`Issues (${issues.length})`} />
        <Tab label={`Feedback (${feedback.length})`} />
        <Tab label={`Notes (${notes.length})`} />
      </Tabs>

      {tab === 0 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead><TableRow>
              <TableCell>Date</TableCell><TableCell>Title</TableCell><TableCell>Category</TableCell>
              <TableCell>Status</TableCell><TableCell>Priority</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {tasks.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                  <TableCell>{t.title}</TableCell><TableCell>{t.category}</TableCell>
                  <TableCell><Chip label={t.status} size="small" /></TableCell>
                  <TableCell>{t.priority}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {tab === 1 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead><TableRow>
              <TableCell>Date</TableCell><TableCell>Title</TableCell>
              <TableCell>Severity</TableCell><TableCell>Status</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {issues.map((i) => (
                <TableRow key={i.id}>
                  <TableCell>{new Date(i.date).toLocaleDateString()}</TableCell>
                  <TableCell>{i.title}</TableCell><TableCell>{i.severity}</TableCell>
                  <TableCell><Chip label={i.status} size="small" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {tab === 2 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead><TableRow>
              <TableCell>Date</TableCell><TableCell>Subject</TableCell><TableCell>Type</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {feedback.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>{new Date(f.date).toLocaleDateString()}</TableCell>
                  <TableCell>{f.subject}</TableCell><TableCell>{f.type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {tab === 3 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead><TableRow>
              <TableCell>Date</TableCell><TableCell>Title</TableCell><TableCell>Tags</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {notes.map((n) => (
                <TableRow key={n.id}>
                  <TableCell>{new Date(n.date).toLocaleDateString()}</TableCell>
                  <TableCell>{n.title}</TableCell><TableCell>{n.tags?.join(', ')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
