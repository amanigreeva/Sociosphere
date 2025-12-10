import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, CircularProgress, Container, Tabs, Tab, useTheme } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Post from '../components/Post';
import ReelItem from '../components/ReelItem';
import Sidebar from '../components/Sidebar';

export default function SavedPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const { user, token } = useAuth();
    const theme = useTheme();

    const isVideo = (url) => {
        if (!url) return false;
        const videoExtensions = ['.mp4', '.mov', '.webm', '.ogg'];
        return videoExtensions.some(ext => url.toLowerCase().includes(ext));
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    useEffect(() => {
        const fetchSavedPosts = async () => {
            if (!user?._id || !token) return;
            try {
                const res = await axios.get(`/api/users/${user._id}/saved`, {
                    headers: { 'x-auth-token': token }
                });
                setPosts(res.data);
            } catch (err) {
                console.error("Error fetching saved posts:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSavedPosts();
    }, [user, token]);

    const handleUnsaveFromList = (postId) => {
        // Optimistically remove the post from the list
        setPosts(posts.filter(p => p._id !== postId));
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh', color: 'text.primary' }}>
                <Sidebar />
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CircularProgress color="inherit" />
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh', color: 'text.primary' }}>
            <Sidebar />
            <Box sx={{ flex: 1, marginLeft: '70px', display: 'flex', justifyContent: 'center', py: 4 }}>
                <Box sx={{ width: '100%', maxWidth: '600px' }}>
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 3, color: 'text.primary' }}>
                        Saved
                    </Typography>

                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        textColor="inherit"
                        sx={{
                            mb: 3,
                            '& .MuiTabs-indicator': { bgcolor: 'primary.main' },
                            borderBottom: 1,
                            borderColor: 'divider'
                        }}
                    >
                        <Tab label="Posts" sx={{ color: 'text.secondary', '&.Mui-selected': { color: 'text.primary' }, fontWeight: 600 }} />
                        <Tab label="Reels" sx={{ color: 'text.secondary', '&.Mui-selected': { color: 'text.primary' }, fontWeight: 600 }} />
                    </Tabs>

                    {posts.filter(p => {
                        const mediaSrc = (p.media && p.media.length > 0) ? p.media[0] : p.image;
                        const isReel = isVideo(mediaSrc);
                        return tabValue === 0 ? !isReel : isReel;
                    }).length === 0 ? (
                        <Box sx={{ textAlign: 'center', mt: 4 }}>
                            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                                No saved {tabValue === 0 ? 'posts' : 'reels'} yet.
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={tabValue === 1 ? { width: '100%', maxWidth: '450px', mx: 'auto' } : {}}>
                            {posts.filter(p => {
                                const mediaSrc = (p.media && p.media.length > 0) ? p.media[0] : p.image;
                                const isReel = isVideo(mediaSrc);
                                return tabValue === 0 ? !isReel : isReel;
                            }).map(post => {
                                if (tabValue === 1) {
                                    // Simplified active state (always active or requires click)
                                    // For Saved view, let's pass isActive=true to test, or maybe we don't want auto-play chaos.
                                    // Better: isActive=false so they have click to play.
                                    // ReelItem has click handler: paused ? play : pause. 
                                    // If isActive is false, it pauses. 
                                    // If we pass true, it plays.
                                    // Let's pass false and rely on user interaction.
                                    return (
                                        <Box key={post._id} sx={{ mb: 0, height: '100vh', scrollSnapAlign: 'start' }}>
                                            <ReelItem post={post} isActive={false} />
                                        </Box>
                                    );
                                }
                                return (
                                    <Post
                                        key={post._id}
                                        post={post}
                                        onUnsave={() => handleUnsaveFromList(post._id)}
                                    />
                                );
                            })}
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
