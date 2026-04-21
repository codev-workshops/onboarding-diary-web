import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
} from '@mui/material';
import { authApi } from '../../api/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.forgotPassword(email);
      setSuccess(true);
    } catch {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom>Check Your Email</Typography>
            <Typography>
              If an account with that email exists, we've sent a password reset link.
            </Typography>
            <Button component={RouterLink} to="/login" sx={{ mt: 2 }}>
              Back to Login
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>Forgot Password</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter your email and we'll send you a reset link.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoFocus
            />
            <Button fullWidth type="submit" variant="contained" disabled={loading} sx={{ mt: 2, mb: 2 }}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
            <Link component={RouterLink} to="/login" variant="body2">
              Back to Login
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
