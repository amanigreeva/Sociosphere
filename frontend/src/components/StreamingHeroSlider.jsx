import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, IconButton, useTheme, Dialog, DialogContent } from '@mui/material';
import { PlayArrow, InfoOutlined, ArrowBackIosNew, ArrowForwardIos, Close } from '@mui/icons-material';

const StreamingHeroSlider = ({ streams = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [openModal, setOpenModal] = useState(false);
    const [openInfoModal, setOpenInfoModal] = useState(false);
    const theme = useTheme();
    const navigate = useNavigate();

    // If no streams, show a default or placeholder
    const hasStreams = streams.length > 0;
    const currentStream = hasStreams ? streams[currentIndex] : null;

    useEffect(() => {
        if (hasStreams) {
            const timer = setInterval(() => {
                handleNext();
            }, 8000); // Auto-slide every 8 seconds
            return () => clearInterval(timer);
        }
    }, [currentIndex, hasStreams]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % streams.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + streams.length) % streams.length);
    };

    if (!hasStreams) {
        return (
            <Box
                sx={{
                    width: '100%',
                    height: { xs: 300, md: 450 },
                    borderRadius: 4,
                    overflow: 'hidden',
                    mb: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'action.hover',
                }}
            >
                <Typography variant="h5" color="text.secondary">
                    No Streaming Available
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                width: '100%',
                height: { xs: 300, md: 450 },
                position: 'relative',
                borderRadius: 4,
                overflow: 'hidden',
                mb: 4,
                boxShadow: theme.shadows[10],
                bgcolor: 'black', // Fallback
            }}
        >
            {/* Background Image/Video Layer */}
            <Box
                key={currentStream._id} // Key to trigger animation on change
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `url(${currentStream.thumbnailUrl || 'https://images.unsplash.com/photo-1626379953861-615bc4dacbb8?auto=format&fit=crop&q=80&w=2000'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transition: 'opacity 0.5s ease-in-out',
                    animation: 'fadeIn 0.5s ease-in-out',
                }}
            />

            {/* Gradient Overlay - Left to Right & Bottom to Top */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, transparent 100%),
                                 linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 50%)`,
                }}
            />

            {/* Content Layer */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center', // Center vertically like Disney+ mostly does for text area
                    alignItems: 'flex-start',
                    pl: { xs: 3, md: 6 },
                    pr: { xs: 3, md: 6 },
                    pb: { xs: 4, md: 8 },
                }}
            >
                {/* Category/Tag */}
                {currentStream.category && (
                    <Typography
                        variant="overline"
                        sx={{
                            color: '#ffcc00', // Gold/Yellow for category
                            fontWeight: 'bold',
                            letterSpacing: 2,
                            fontSize: '0.9rem',
                            mb: 1,
                            textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                        }}
                    >
                        {currentStream.category.toUpperCase()} • {currentStream.type === 'live' ? 'LIVE' : 'VIDEO'}
                    </Typography>
                )}

                {/* Title */}
                <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                        color: 'white',
                        fontWeight: 900,
                        mb: 2,
                        fontSize: { xs: '2rem', md: '3.5rem' },
                        maxWidth: '80%',
                        lineHeight: 1.1,
                        textTransform: 'uppercase',
                        textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                    }}
                >
                    {currentStream.title || 'Untitled Stream'}
                </Typography>

                {/* Description - User info */}
                <Typography
                    variant="h6"
                    sx={{
                        color: 'rgba(255,255,255,0.9)',
                        mb: 4,
                        maxWidth: '600px',
                        fontWeight: 400,
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                >
                    Streamed by {currentStream.user?.username || 'Unknown Creator'}
                </Typography>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<PlayArrow sx={{ fontSize: '2rem !important' }} />}
                        onClick={() => setOpenModal(true)}
                        sx={{
                            bgcolor: 'white',
                            color: 'black',
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            px: 4,
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: 'none',
                            transition: 'all 0.2s',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.8)',
                                transform: 'scale(1.02)',
                            },
                        }}
                    >
                        Start Watching
                    </Button>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => setOpenInfoModal(true)}
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            px: 3,
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: 'none',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.2s',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.3)',
                                transform: 'scale(1.02)',
                            },
                        }}
                    >
                        More Info
                    </Button>
                </Box>
            </Box>

            {/* Navigation Arrows */}
            <IconButton
                onClick={handlePrev}
                sx={{
                    position: 'absolute',
                    left: 20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'white',
                    bgcolor: 'rgba(0,0,0,0.3)',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' },
                    display: { xs: 'none', md: 'flex' },
                }}
            >
                <ArrowBackIosNew />
            </IconButton>
            <IconButton
                onClick={handleNext}
                sx={{
                    position: 'absolute',
                    right: 20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'white',
                    bgcolor: 'rgba(0,0,0,0.3)',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' },
                    display: { xs: 'none', md: 'flex' },
                }}
            >
                <ArrowForwardIos />
            </IconButton>

            {/* Dots Indicators */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 20,
                    right: 40,
                    display: 'flex',
                    gap: 1,
                }}
            >
                {streams.map((_, index) => (
                    <Box
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        sx={{
                            width: index === currentIndex ? 12 : 8,
                            height: index === currentIndex ? 12 : 8,
                            borderRadius: '50%',
                            bgcolor: index === currentIndex ? 'white' : 'rgba(255,255,255,0.4)',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                        }}
                    />
                ))}
            </Box>

            {/* Video Modal */}
            <Dialog
                open={openModal}
                onClose={() => setOpenModal(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: 'black',
                        color: 'white',
                        borderRadius: 3,
                        overflow: 'hidden',
                        aspectRatio: '16/9',
                        maxHeight: '80vh'
                    }
                }}
            >
                {/* Close Button */}
                <IconButton
                    onClick={() => setOpenModal(false)}
                    sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        color: 'white',
                        zIndex: 10,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                    }}
                >
                    <Close />
                </IconButton>

                <DialogContent sx={{ p: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {currentStream && (
                        currentStream.mediaUrl ? (
                            <video
                                src={currentStream.mediaUrl}
                                controls
                                autoPlay
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain'
                                }}
                            />
                        ) : (
                            // Fallback for streams without mediaUrl (e.g. only external link)
                            <Box sx={{ textAlign: 'center', p: 4 }}>
                                <Typography variant="h5" sx={{ mb: 2 }}>
                                    This stream is hosted externally.
                                </Typography>
                                {currentStream.liveLink && (
                                    <Button
                                        variant="contained"
                                        href={currentStream.liveLink}
                                        target="_blank"
                                        startIcon={<PlayArrow />}
                                    >
                                        Watch on {new URL(currentStream.liveLink).hostname}
                                    </Button>
                                )}
                            </Box>
                        )
                    )}
                </DialogContent>
            </Dialog>

            {/* More Info Modal */}
            <Dialog
                open={openInfoModal}
                onClose={() => setOpenInfoModal(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                        borderRadius: 3,
                        p: 2
                    }
                }}
            >
                <IconButton
                    onClick={() => setOpenInfoModal(false)}
                    sx={{ position: 'absolute', top: 10, right: 10 }}
                >
                    <Close />
                </IconButton>
                <DialogContent>
                    {currentStream && (
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                            {/* Thumbnail */}
                            <Box sx={{ flex: '0 0 40%' }}>
                                <Box
                                    component="img"
                                    src={currentStream.thumbnailUrl || 'https://images.unsplash.com/photo-1626379953861-615bc4dacbb8?auto=format&fit=crop&q=80&w=2000'}
                                    sx={{
                                        width: '100%',
                                        borderRadius: 2,
                                        aspectRatio: '16/9',
                                        objectFit: 'cover'
                                    }}
                                />
                            </Box>
                            {/* Details */}
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {currentStream.title || 'Untitled Stream'}
                                </Typography>
                                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                                    {currentStream.category} • {currentStream.type === 'live' ? 'LIVE' : 'Video'}
                                </Typography>

                                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold', mt: 2 }}>
                                    Description
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                                    {currentStream.description || "No description available for this stream."}
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>
                                        Creator:
                                    </Typography>
                                    <Typography variant="body2" color="primary">
                                        {currentStream.user?.username || 'Unknown'}
                                    </Typography>
                                </Box>

                                <Button
                                    variant="contained"
                                    startIcon={<PlayArrow />}
                                    onClick={() => {
                                        setOpenInfoModal(false); // Close info
                                        setTimeout(() => setOpenModal(true), 200); // Open video
                                    }}
                                    sx={{ fontWeight: 'bold' }}
                                >
                                    Start Watching Now
                                </Button>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                `}
            </style>
        </Box>
    );
};

export default StreamingHeroSlider;
