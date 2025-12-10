// frontend/src/pages/Streaming.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Card, CardMedia, CardContent, Chip, useTheme, CircularProgress } from '@mui/material';
import Sidebar from '../components/Sidebar';
import StreamingHeroSlider from '../components/StreamingHeroSlider';
import { PlayArrow, Circle } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Streaming = () => {
    const [activeTab, setActiveTab] = useState('live'); // 'live' or 'non-live'
    const [streams, setStreams] = useState([]);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();
    const { token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStreams = async () => {
            try {
                const res = await axios.get('/api/streams', {
                    headers: { 'x-auth-token': token }
                });
                setStreams(res.data);
            } catch (err) {
                console.error("Error fetching streams:", err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchStreams();
    }, [token]);

    const liveStreams = streams.filter(s => s.type === 'live');
    const nonLiveStreams = streams.filter(s => s.type === 'non-live');

    const currentData = activeTab === 'live' ? liveStreams : nonLiveStreams;

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            <Sidebar />
            <Box sx={{ flex: 1, ml: { xs: 0, md: '72px' }, p: 3 }}>

                {/* Hero Section */}
                <StreamingHeroSlider streams={streams} />

                {/* Toggle Buttons */}
                <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                    <Button
                        variant={activeTab === 'live' ? 'contained' : 'outlined'}
                        onClick={() => setActiveTab('live')}
                        startIcon={<Circle sx={{ color: activeTab === 'live' ? 'white' : 'red', fontSize: 12 }} />}
                        sx={{
                            borderRadius: 20,
                            px: 4,
                            textTransform: 'none',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            bgcolor: activeTab === 'live' ? 'error.main' : 'transparent',
                            borderColor: 'error.main',
                            color: activeTab === 'live' ? 'white' : 'error.main',
                            '&:hover': {
                                bgcolor: activeTab === 'live' ? 'error.dark' : 'rgba(211, 47, 47, 0.1)',
                                borderColor: 'error.main'
                            }
                        }}
                    >
                        Live
                    </Button>
                    <Button
                        variant={activeTab === 'non-live' ? 'contained' : 'outlined'}
                        onClick={() => setActiveTab('non-live')}
                        sx={{
                            borderRadius: 20,
                            px: 4,
                            textTransform: 'none',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            borderColor: theme.palette.text.primary,
                            color: activeTab === 'non-live' ? theme.palette.background.default : theme.palette.text.primary,
                            bgcolor: activeTab === 'non-live' ? theme.palette.text.primary : 'transparent',
                            '&:hover': {
                                bgcolor: activeTab === 'non-live' ? theme.palette.text.secondary : 'rgba(128,128,128, 0.1)',
                                borderColor: theme.palette.text.primary
                            }
                        }}
                    >
                        Non-Live
                    </Button>
                </Box>

                {/* Content Sections */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {currentData.length > 0 ? (
                            currentData.map((item) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                                    <Card sx={{
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        boxShadow: 3,
                                        transition: 'transform 0.2s',
                                        '&:hover': { transform: 'translateY(-4px)' }
                                    }}>
                                        <Box sx={{ position: 'relative' }}>
                                            {item.type === 'non-live' && item.mediaUrl ? (
                                                <CardMedia
                                                    component="video"
                                                    height="200"
                                                    src={item.mediaUrl}
                                                    controls
                                                    sx={{ objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <CardMedia
                                                    component="img"
                                                    height="200"
                                                    image={item.thumbnailUrl || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop"}
                                                    alt={item.title}
                                                />
                                            )}

                                            {activeTab === 'live' && (
                                                <Chip
                                                    label="LIVE"
                                                    color="error"
                                                    size="small"
                                                    sx={{ position: 'absolute', top: 10, left: 10, fontWeight: 'bold' }}
                                                />
                                            )}
                                        </Box>
                                        <CardContent>
                                            <Typography variant="h6" noWrap>{item.title}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {item.user?.username} • {item.category}
                                            </Typography>
                                            {item.type === 'live' && item.liveLink && (
                                                <Button
                                                    size="small"
                                                    href={item.liveLink}
                                                    target="_blank"
                                                    sx={{ mt: 1 }}
                                                >
                                                    Watch on External Site
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))
                        ) : (
                            <Box sx={{ width: '100%', textAlign: 'center', mt: 5 }}>
                                <Typography variant="h6" color="text.secondary">No streams found in this category.</Typography>
                            </Box>
                        )}
                    </Grid>
                )}
            </Box>
        </Box>
    );
};

export default Streaming;
