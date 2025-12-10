import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Card, CardMedia, CircularProgress, IconButton } from '@mui/material';
import { PlayArrow, Favorite, FavoriteBorder, ChatBubbleOutline, ChevronLeft, ChevronRight, Bookmark, BookmarkBorder } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const CategoryReels = ({ category }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const scrollContainerRef = useRef(null);
    const [savedPosts, setSavedPosts] = useState([]);

    useEffect(() => {
        if (user && user.savedPosts) {
            setSavedPosts(user.savedPosts);
        }
    }, [user]);

    useEffect(() => {
        fetchPosts();
    }, [category]);

    const isVideo = (url) => {
        if (!url) return false;
        const videoExtensions = ['.mp4', '.mov', '.webm', '.ogg'];
        return videoExtensions.some(ext => url.toLowerCase().includes(ext));
    };

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/posts/category/${category}`, {
                headers: { 'x-auth-token': token },
            });
            // Filter: Must have media AND it must NOT be a video (Images Only)
            const imagePosts = res.data.filter(post => {
                const mediaUrl = (post.media && post.media.length > 0) ? post.media[0] : post.image;
                if (!mediaUrl) return false;
                return !isVideo(mediaUrl);
            });
            setPosts(imagePosts);
        } catch (err) {
            console.error('Error fetching category posts:', err);
        } finally {
            setLoading(false);
        }
    };

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = (220 + 16) * 4;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const handleLike = async (e, postId) => {
        e.stopPropagation();
        try {
            await axios.put(`/api/posts/${postId}/like`, {}, {
                headers: { 'x-auth-token': token }
            });

            setPosts(prevPosts => prevPosts.map(p => {
                if (p._id === postId) {
                    const isLiked = p.likes.includes(user?._id);
                    return {
                        ...p,
                        likes: isLiked ? p.likes.filter(id => id !== user?._id) : [...p.likes, user?._id]
                    };
                }
                return p;
            }));
        } catch (err) {
            console.error('Like error:', err);
        }
    };

    const handleSave = async (e, postId) => {
        e.stopPropagation();
        try {
            await axios.put(`/api/users/${user._id}/save/${postId}`, {}, {
                headers: { 'x-auth-token': token }
            });

            // Toggle saved state locally
            const isSaved = savedPosts.includes(postId);
            let newSavedPosts;

            if (isSaved) {
                newSavedPosts = savedPosts.filter(id => id !== postId);
                toast.success('Post unsaved');
            } else {
                newSavedPosts = [...savedPosts, postId];
                toast.success('Post saved');
            }

            setSavedPosts(newSavedPosts);

            // Update localStorage to keep sync across components (basic implementation)
            const localUser = JSON.parse(localStorage.getItem("user"));
            if (localUser) {
                localUser.savedPosts = newSavedPosts;
                localStorage.setItem("user", JSON.stringify(localUser));
            }

        } catch (err) {
            console.error('Save error:', err);
            toast.error('Failed to update save status');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress sx={{ color: 'white' }} />
            </Box>
        );
    }

    if (posts.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" sx={{ color: '#a8a8a8' }}>
                    No content available in this category
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ position: 'relative' }}>
            {/* Left Arrow */}
            {posts.length > 4 && (
                <IconButton
                    onClick={() => scroll('left')}
                    sx={{
                        position: 'absolute',
                        left: -20,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        zIndex: 2,
                        '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.95)',
                        },
                        width: 40,
                        height: 40,
                    }}
                >
                    <ChevronLeft />
                </IconButton>
            )}

            <Box
                ref={scrollContainerRef}
                sx={{
                    display: 'flex',
                    gap: 2,
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    pb: 2,
                    scrollBehavior: 'smooth',
                    // Visible styled scrollbar
                    '&::-webkit-scrollbar': {
                        height: 10,
                    },
                    '&::-webkit-scrollbar-track': {
                        bgcolor: 'rgba(255,255,255,0.1)',
                        borderRadius: 5,
                    },
                    '&::-webkit-scrollbar-thumb': {
                        bgcolor: 'rgba(255,255,255,0.3)',
                        borderRadius: 5,
                        transition: 'background-color 0.3s',
                        '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.5)',
                        },
                    },
                }}
            >
                {posts.map((post) => (
                    <Card
                        key={post._id}
                        onClick={() => navigate(`/post/${post._id}`)}
                        sx={{
                            minWidth: 220,
                            maxWidth: 220,
                            height: 350,
                            bgcolor: '#1a1a1a',
                            borderRadius: 3,
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden',
                            flexShrink: 0,
                            transition: 'all 0.3s',
                            '&:hover': {
                                transform: 'scale(1.05)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                                zIndex: 1,
                            },
                        }}
                    >
                        <CardMedia
                            component="img"
                            height="350"
                            image={post.media[0]}
                            alt={post.text || 'Post'}
                            sx={{
                                objectFit: 'cover',
                            }}
                        />

                        {/* Gradient Overlay */}
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: '50%',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                            }}
                        />

                        {/* Content Info */}
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                p: 2,
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'white',
                                    fontWeight: 600,
                                    mb: 1,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                                }}
                            >
                                {post.text || 'Watch this'}
                            </Typography>

                            {/* Engagement Stats & Actions */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {/* Like Button */}
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleLike(e, post._id)}
                                            sx={{
                                                p: 0.5,
                                                color: post.likes?.includes(user?._id) ? '#ed4956' : 'white',
                                                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                                            }}
                                        >
                                            {post.likes?.includes(user?._id) ?
                                                <Favorite sx={{ fontSize: 20 }} /> :
                                                <FavoriteBorder sx={{ fontSize: 20 }} />
                                            }
                                        </IconButton>
                                        <Typography variant="caption" sx={{ color: 'white', ml: 0.5, fontWeight: 600 }}>
                                            {post.likes?.length || 0}
                                        </Typography>
                                    </Box>

                                    {/* Comment Icon (Visual Only for now) */}
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <IconButton
                                            size="small"
                                            disabled
                                            sx={{ p: 0.5, color: 'white' }}
                                        >
                                            <ChatBubbleOutline sx={{ fontSize: 20 }} />
                                        </IconButton>
                                        <Typography variant="caption" sx={{ color: 'white', ml: 0.5, fontWeight: 600 }}>
                                            {post.comments?.length || 0}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Save Button */}
                                <IconButton
                                    size="small"
                                    onClick={(e) => handleSave(e, post._id)}
                                    sx={{
                                        p: 0.5,
                                        color: 'white',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                                    }}
                                >
                                    {savedPosts.includes(post._id) ?
                                        <Bookmark sx={{ fontSize: 20 }} /> :
                                        <BookmarkBorder sx={{ fontSize: 20 }} />
                                    }
                                </IconButton>
                            </Box>
                        </Box>
                    </Card>
                ))}
            </Box>

            {/* Right Arrow */}
            {posts.length > 4 && (
                <IconButton
                    onClick={() => scroll('right')}
                    sx={{
                        position: 'absolute',
                        right: -20,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        zIndex: 2,
                        '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.95)',
                        },
                        width: 40,
                        height: 40,
                    }}
                >
                    <ChevronRight />
                </IconButton>
            )}
        </Box>
    );
};

export default CategoryReels;
