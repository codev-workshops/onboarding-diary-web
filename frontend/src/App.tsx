import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import TaskListPage from './pages/tasks/TaskListPage';
import TaskFormPage from './pages/tasks/TaskFormPage';
import IssueListPage from './pages/issues/IssueListPage';
import IssueFormPage from './pages/issues/IssueFormPage';
import ResolveIssuePage from './pages/issues/ResolveIssuePage';
import FeedbackListPage from './pages/feedback/FeedbackListPage';
import FeedbackFormPage from './pages/feedback/FeedbackFormPage';
import NoteListPage from './pages/notes/NoteListPage';
import NoteFormPage from './pages/notes/NoteFormPage';
import ReportsPage from './pages/reports/ReportsPage';
import ProfilePage from './pages/profile/ProfilePage';
import RecruitListPage from './pages/manager/RecruitListPage';
import RecruitDetailPage from './pages/manager/RecruitDetailPage';
import UserListPage from './pages/admin/UserListPage';
import UserFormPage from './pages/admin/UserFormPage';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />

              {/* Tasks */}
              <Route path="tasks" element={<TaskListPage />} />
              <Route path="tasks/new" element={<TaskFormPage />} />
              <Route path="tasks/:id/edit" element={<TaskFormPage />} />

              {/* Issues */}
              <Route path="issues" element={<IssueListPage />} />
              <Route path="issues/new" element={<IssueFormPage />} />
              <Route path="issues/:id/edit" element={<IssueFormPage />} />
              <Route path="issues/:id/resolve" element={<ResolveIssuePage />} />

              {/* Feedback */}
              <Route path="feedback" element={<FeedbackListPage />} />
              <Route path="feedback/new" element={<FeedbackFormPage />} />
              <Route path="feedback/:id/edit" element={<FeedbackFormPage />} />

              {/* Notes */}
              <Route path="notes" element={<NoteListPage />} />
              <Route path="notes/new" element={<NoteFormPage />} />
              <Route path="notes/:id/edit" element={<NoteFormPage />} />

              {/* Reports */}
              <Route path="reports" element={<ReportsPage />} />

              {/* Profile */}
              <Route path="profile" element={<ProfilePage />} />

              {/* Manager routes */}
              <Route
                path="manager/recruits"
                element={
                  <ProtectedRoute roles={['manager', 'admin']}>
                    <RecruitListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="manager/recruits/:id"
                element={
                  <ProtectedRoute roles={['manager', 'admin']}>
                    <RecruitDetailPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin routes */}
              <Route
                path="admin/users"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <UserListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/users/new"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <UserFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/users/:id/edit"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <UserFormPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
