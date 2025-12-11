// frontend/src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  Alert
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, loading, error, clearErrors } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      if (clearErrors) clearErrors();
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;

    setIsSubmitting(true);
    try {
      const success = await login(formData);
      if (success) {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: 'background.default',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      py: 4
    }}>
      <Container component="main" maxWidth="xs">
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderColor: 'divider',
            borderRadius: '1px',
            backgroundColor: 'background.paper'
          }}
        >
          {/* Logo */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Logo size="large" />
          </Box>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}



          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
            <TextField
              margin="dense"
              required
              fullWidth
              id="email"
              label="Phone number, username, or email"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              disabled={loading || isSubmitting}
              size="small"
              sx={{
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'background.default',
                  '& fieldset': { borderColor: 'divider' },
                  '&:hover fieldset': { borderColor: 'text.secondary' },
                }
              }}
            />
            <TextField
              margin="dense"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading || isSubmitting}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'background.default',
                  '& fieldset': { borderColor: 'divider' },
                  '&:hover fieldset': { borderColor: 'text.secondary' },
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || isSubmitting || !formData.email || !formData.password}
              sx={{
                mt: 1,
                mb: 2,
                bgcolor: 'primary.main',
                textTransform: 'none',
                fontWeight: 'bold',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: 'primary.dark',
                  boxShadow: 'none'
                },
                '&:disabled': {
                  bgcolor: 'action.disabledBackground',
                  color: 'action.disabled'
                }
              }}
            >
              {(loading || isSubmitting) ? <CircularProgress size={24} color="inherit" /> : 'Log in'}
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
              <Typography variant="body2" sx={{ mx: 2, color: 'text.secondary', fontWeight: 'bold' }}>OR</Typography>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
            </Box>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <MuiLink
                component={Link}
                to="/forgot-password"
                variant="caption"
                sx={{ textDecoration: 'none', color: 'primary.main' }}
              >
                Forgot password?
              </MuiLink>
            </Box>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            mt: 2,
            p: 2.5,
            textAlign: 'center',
            borderColor: 'divider',
            borderRadius: '1px',
            backgroundColor: 'background.paper'
          }}
        >
          <Typography variant="body2" sx={{ color: 'text.primary' }}>
            Don&apos;t have an account?{' '}
            <MuiLink
              component={Link}
              to="/register"
              sx={{ textDecoration: 'none', color: 'primary.main', fontWeight: 'bold' }}
            >
              Sign up
            </MuiLink>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;