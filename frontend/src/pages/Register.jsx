// frontend/src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.name || !formData.username) return;

    setIsLoading(true);
    try {
      const success = await register(formData);
      if (success) {
        navigate('/');
      }
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
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
          {/* Logo Section */}
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <Logo size="large" />
          </Box>

          <Typography variant="body1" align="center" sx={{ mb: 3, color: 'text.secondary', fontWeight: 600, lineHeight: '20px' }}>
            Sign up to see photos and videos from your friends.
          </Typography>



          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
            <TextField
              margin="dense"
              required
              fullWidth
              id="email"
              label="Mobile Number or Email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
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
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
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
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
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
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
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

            <Typography variant="caption" display="block" align="center" sx={{ color: 'text.secondary', mb: 2 }}>
              People who use our service may have uploaded your contact information to Soci∞rbit.{' '}
              <MuiLink href="#" sx={{ color: 'primary.main', textDecoration: 'none' }}>Learn More</MuiLink>
            </Typography>

            <Typography variant="caption" display="block" align="center" sx={{ color: 'text.secondary', mb: 2 }}>
              By signing up, you agree to our{' '}
              <MuiLink href="#" sx={{ color: 'primary.main', textDecoration: 'none' }}>Terms</MuiLink>,{' '}
              <MuiLink href="#" sx={{ color: 'primary.main', textDecoration: 'none' }}>Privacy Policy</MuiLink> and{' '}
              <MuiLink href="#" sx={{ color: 'primary.main', textDecoration: 'none' }}>Cookies Policy</MuiLink>.
            </Typography>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading || !formData.email || !formData.password || !formData.name || !formData.username}
              sx={{
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
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign up'}
            </Button>
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
            Have an account?{' '}
            <MuiLink
              component={Link}
              to="/login"
              sx={{ textDecoration: 'none', color: 'primary.main', fontWeight: 'bold' }}
            >
              Log in
            </MuiLink>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
