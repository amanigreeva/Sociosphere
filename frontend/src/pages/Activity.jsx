import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Grid, CircularProgress, IconButton } from '@mui/material';
import { Bookmark, Favorite, Comment, Reply, MoreVert } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const ReelGridItem = ({ post, isVideoFn, isReelView }) => {
    return (
        <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
            {isVideoFn(post.media?.[0] || post.image) ? (
                <video
                    src={post.media?.[0] || post.image}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            ) : (
                <img
                    src={post.media?.[0] || post.image}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            )}
        </Box>
    );
};

const Activity = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const { token } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Helper: isVideo
    const isVideo = (url) => {
        if (!url) return false;
        const videoExtensions = ['.mp4', '.mov', '.webm', '.ogg'];
        const lowerUrl = url.toLowerCase();
        for (let ext of videoExtensions) {
            if (lowerUrl.includes(ext)) return true;
        }
        return false;
    };

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Parse query params for initial tab
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab === 'liked') setActiveTab(1);
        else if (tab === 'commented') setActiveTab(2);
        else setActiveTab(0); // Default to Archived
    }, [location.search]);

    // Fetch posts based on tab
    useEffect(() => {
        if (!token) return;

        const fetchPosts = async () => {
            setLoading(true);
            try {
                let endpoint = '';
                if (activeTab === 0) endpoint = '/api/posts/archived';
                else if (activeTab === 1) endpoint = '/api/posts/liked';
                else if (activeTab === 2) endpoint = '/api/posts/commented';

                const res = await axios.get(endpoint, {
                    headers: { 'x-auth-token': token }
                });
                setPosts(res.data);
            } catch (err) {
                console.error("Error fetching activity:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [activeTab, token]);

    const handleUnarchive = async (e, postId) => {
        e.stopPropagation();
        try {
            await axios.put(`/api/posts/${postId}/archive`, {}, {
                headers: { 'x-auth-token': token }
            });
            // Remove from list
            setPosts(prev => prev.filter(p => p._id !== postId));
        } catch (err) {
            console.error("Error unarchiving:", err);
        }
    };

    return (
        <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh', color: 'text.primary' }}>
            <Sidebar />
            <Box sx={{
                flex: 1,
                marginLeft: '72px',
                p: { xs: 2, md: 4 },
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '935px',
                margin: '0 auto',
                width: '100%'
            }}>
                {/* Back Button */}
                <Box sx={{ mb: 4, mt: 4 }}>
                    <IconButton
                        onClick={() => navigate(-1)}
                        sx={{
                            color: 'text.primary',
                            bgcolor: 'background.paper',
                            boxShadow: 3,
                            '&:hover': { bgcolor: 'action.hover' }
                        }}
                    >
                        <Reply />
                    </IconButton>
                </Box>

                <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Your Activity</Typography>

                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    textColor="inherit"
                    indicatorColor="primary"
                    sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab icon={<Bookmark />} iconPosition="start" label="Archived" />
                    <Tab icon={<Favorite />} iconPosition="start" label="Liked" />
                    <Tab icon={<Comment />} iconPosition="start" label="Comments" />
                </Tabs>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                        <CircularProgress color="inherit" />
                    </Box>
                ) : (
                    <>
                        {/* Posts Section */}
                        {posts.filter(p => !isVideo(p.media?.[0] || p.image)).length > 0 && (
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Posts</Typography>
                                <Grid container spacing={0.5}>
                                    {posts.filter(p => !isVideo(p.media?.[0] || p.image)).map((post) => (
                                        <Grid item xs={4} key={post._id}>
                                            <Box
                                                sx={{
                                                    position: 'relative',
                                                    paddingTop: '100%',
                                                    bgcolor: '#121212',
                                                    cursor: 'pointer',
                                                    '&:hover .overlay': { display: 'flex' }
                                                }}
                                                onClick={() => navigate(`/post/${post._id}`)}
                                            >
                                                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                                                    <ReelGridItem post={post} isVideoFn={isVideo} />
                                                </Box>

                                                {/* Unarchive Button (Only for Archive Tab) */}
                                                {activeTab === 0 && (
                                                    <IconButton
                                                        onClick={(e) => handleUnarchive(e, post._id)}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 5,
                                                            right: 5,
                                                            bgcolor: 'rgba(0,0,0,0.6)',
                                                            color: 'white',
                                                            '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                                                        }}
                                                        size="small"
                                                        title="Unarchive"
                                                    >
                                                        <MoreVert />
                                                    </IconButton>
                                                )}

                                                {/* Hover Overlay */}
                                                <Box
                                                    className="overlay"
                                                    sx={{
                                                        display: 'none',
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        bgcolor: 'rgba(0,0,0,0.3)',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        gap: 2
                                                    }}
                                                >
                                                    <Typography fontWeight="bold">❤️ {post.likes?.length || 0}</Typography>
                                                    <Typography fontWeight="bold">💬 {post.comments?.length || 0}</Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}

                        {/* Divider if both exist */}
                        {posts.filter(p => !isVideo(p.media?.[0] || p.image)).length > 0 &&
                            posts.filter(p => isVideo(p.media?.[0] || p.image)).length > 0 && (
                                <Box sx={{ height: '1px', bgcolor: 'divider', mb: 4 }} />
                            )}

                        {/* Reels Section */}
                        {posts.filter(p => isVideo(p.media?.[0] || p.image)).length > 0 && (
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Reels</Typography>
                                <Grid container spacing={0.5}>
                                    {posts.filter(p => isVideo(p.media?.[0] || p.image)).map((post) => (
                                        <Grid item xs={4} key={post._id}>
                                            <Box
                                                sx={{
                                                    position: 'relative',
                                                    paddingTop: '177.77%', // 9:16 AR for Reels
                                                    bgcolor: '#121212',
                                                    cursor: 'pointer',
                                                    '&:hover .overlay': { display: 'flex' }
                                                }}
                                                onClick={() => navigate(`/post/${post._id}`)}
                                            >
                                                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                                                    <ReelGridItem post={post} isVideoFn={isVideo} />
                                                </Box>

                                                {/* Unarchive Button (Only for Archive Tab) */}
                                                {activeTab === 0 && (
                                                    <IconButton
                                                        onClick={(e) => handleUnarchive(e, post._id)}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 5,
                                                            right: 5,
                                                            bgcolor: 'rgba(0,0,0,0.6)',
                                                            color: 'white',
                                                            '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                                                        }}
                                                        size="small"
                                                        title="Unarchive"
                                                    >
                                                        <MoreVert />
                                                    </IconButton>
                                                )}

                                                {/* Hover Overlay */}
                                                <Box
                                                    className="overlay"
                                                    sx={{
                                                        display: 'none',
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        bgcolor: 'rgba(0,0,0,0.3)',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        gap: 2
                                                    }}
                                                >
                                                    <Typography fontWeight="bold">❤️ {post.likes?.length || 0}</Typography>
                                                    <Typography fontWeight="bold">💬 {post.comments?.length || 0}</Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}

                        {posts.length === 0 && (
                            <Box sx={{ width: '100%', textAlign: 'center', mt: 5, color: 'text.secondary' }}>
                                <Typography>No posts found.</Typography>
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </Box>
    );
};

export default Activity;
