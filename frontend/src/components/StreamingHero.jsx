import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { PlayArrow } from '@mui/icons-material';

const StreamingHero = () => {
    const navigate = useNavigate();
    return (
        <Box
            sx={{
                width: '100%',
                height: { xs: 300, md: 400 },
                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
                mb: 4,
                display: 'flex',
                alignItems: 'flex-end',
                p: 4,
            }}
        >
            {/* Gradient Overlay */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '60%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
                }}
            />

            {/* Content */}
            <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 600, color: 'primary.contrastText' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: 'inherit' }}>
                    Discover Amazing Content
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                    Explore streams, reels, and videos from creators across different categories
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<PlayArrow />}
                        sx={{
                            bgcolor: 'background.paper',
                            color: 'text.primary',
                            fontWeight: 700,
                            px: 4,
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: 'none',
                            '&:hover': { bgcolor: 'background.default' },
                        }}
                        onClick={() => navigate('/streaming')}
                    >
                        Start Watching
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{
                            borderColor: 'inherit',
                            color: 'inherit',
                            fontWeight: 600,
                            px: 4,
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: 'none',
                            '&:hover': { borderColor: 'inherit', bgcolor: 'rgba(255,255,255,0.1)' },
                        }}
                    >
                        More Info
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default StreamingHero;
