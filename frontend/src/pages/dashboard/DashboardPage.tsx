import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { dashboardApi } from '../../api/dashboard';
import type { DashboardSummary, RecentEntry } from '../../types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentEntries, setRecentEntries] = useState<RecentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, recentRes] = await Promise.all([
          dashboardApi.getSummary(),
          dashboardApi.getRecentEntries(10),
        ]);
        setSummary(summaryRes.data.summary);
        setRecentEntries(recentRes.data.recentEntries);
      } catch {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!summary) return null;

  const summaryCards = [
    { label: 'Total Tasks', value: summary.tasks.total, color: '#1976d2' },
    { label: 'Completed', value: summary.tasks.completed, color: '#2e7d32' },
    { label: 'Open Issues', value: summary.issues.open, color: '#ed6c02' },
    { label: 'Feedback', value: summary.feedback.total, color: '#9c27b0' },
    { label: 'Notes', value: summary.notes.total, color: '#0288d1' },
  ];

  const categoryColors: Record<string, string> = {
    task: 'primary',
    issue: 'error',
    feedback: 'secondary',
    note: 'info',
  };

  const getCategoryPath = (category: string) => {
    const paths: Record<string, string> = { task: '/tasks', issue: '/issues', feedback: '/feedback', note: '/notes' };
    return paths[category] || '/dashboard';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryCards.map((card) => (
          <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={card.label}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ color: card.color }}>{card.value}</Typography>
                <Typography variant="body2" color="text.secondary">{card.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Task Completion</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={summary.completionRate}
                  sx={{ flexGrow: 1, mr: 2, height: 10, borderRadius: 5 }}
                />
                <Typography variant="body2">{summary.completionRate}%</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Days Onboarding: {summary.daysOnboarding}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Open Issues</Typography>
              <Typography variant="h3" color="warning.main">{summary.issues.open}</Typography>
              <Typography variant="body2" color="text.secondary">
                {summary.issues.resolved} resolved of {summary.issues.total} total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Activity</Typography>
              {recentEntries.length === 0 ? (
                <Typography color="text.secondary">No recent activity</Typography>
              ) : (
                <List dense>
                  {recentEntries.map((entry) => (
                    <ListItem
                      key={`${entry.category}-${entry.id}`}
                      onClick={() => navigate(getCategoryPath(entry.category))}
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    >
                      <ListItemText
                        primary={entry.title}
                        secondary={new Date(entry.createdAt).toLocaleDateString()}
                      />
                      <Chip
                        label={entry.category}
                        size="small"
                        color={categoryColors[entry.category] as 'primary' | 'error' | 'secondary' | 'info'}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
