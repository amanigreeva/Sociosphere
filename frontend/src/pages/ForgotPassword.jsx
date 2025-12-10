import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, Paper, Link as MuiLink } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { toast } from 'react-toastify';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Implement forgot password logic here (e.g., API call)
        toast.info("Password reset link sent to your email (Demo)");
        setTimeout(() => {
            navigate("/login");
        }, 2000);
    };

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
                        backgroundColor: 'background.paper',
                        textAlign: 'center'
                    }}
                >
                    <Box sx={{ border: 2, borderColor: 'text.primary', borderRadius: '50%', p: 2, mb: 2, color: 'text.primary' }}>
                        <LockOutlined sx={{ fontSize: 40 }} />
                    </Box>

                    <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary' }}>
                        Trouble Logging In?
                    </Typography>

                    <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                        Enter your email, phone, or username and we'll send you a link to get back into your account.
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                        <TextField
                            margin="dense"
                            required
                            fullWidth
                            id="email"
                            label="Email, Phone, or Username"
                            name="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            size="small"
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
                            sx={{
                                mb: 2,
                                bgcolor: 'primary.main',
                                textTransform: 'none',
                                fontWeight: 'bold',
                                boxShadow: 'none',
                                '&:hover': {
                                    bgcolor: 'primary.dark',
                                    boxShadow: 'none'
                                }
                            }}
                        >
                            Send Login Link
                        </Button>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', my: 2 }}>
                        <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                        <Typography variant="body2" sx={{ mx: 2, color: 'text.secondary', fontWeight: 'bold' }}>OR</Typography>
                        <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                    </Box>

                    <MuiLink
                        component={Link}
                        to="/register"
                        sx={{ color: 'text.primary', fontWeight: 'bold', textDecoration: 'none', mb: 0 }}
                    >
                        Create New Account
                    </MuiLink>
                </Paper>

                <Paper
                    elevation={0}
                    variant="outlined"
                    sx={{
                        mt: 0,
                        p: 2,
                        textAlign: 'center',
                        borderColor: 'divider',
                        borderRadius: '1px',
                        backgroundColor: 'background.paper',
                        borderTop: 1,
                        borderTopColor: 'divider'
                    }}
                >
                    <MuiLink
                        component={Link}
                        to="/login"
                        sx={{ color: 'text.primary', fontWeight: 'bold', textDecoration: 'none' }}
                    >
                        Back to Login
                    </MuiLink>
                </Paper>
            </Container>
        </Box>
    );
}
