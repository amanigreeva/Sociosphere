import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Avatar, IconButton, CircularProgress, TextField, Button } from '@mui/material';
import { ArrowBack, Favorite, FavoriteBorder, ChatBubbleOutline, Bookmark, BookmarkBorder, Download } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const isVideo = (url) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.mov', '.webm', '.ogg'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
};

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, user: currentUser } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    // Safety state for saves/likes to prevent crash if post.likes is undefined
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        fetchPost();
    }, [id]);

    const fetchPost = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/posts/${id}`, {
                headers: { 'x-auth-token': token }
            });
            const fetchedPost = res.data;
            if (!fetchedPost.likes) fetchedPost.likes = [];
            if (!fetchedPost.comments) fetchedPost.comments = [];
            setPost(fetchedPost);

            // Sync saved state
            if (currentUser && currentUser.savedPosts) {
                setIsSaved(currentUser.savedPosts.includes(fetchedPost._id));
            }
        } catch (err) {
            console.error('Error fetching post:', err);
            toast.error('Failed to load post');
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        try {
            await axios.put(`/api/posts/${id}/like`, {}, {
                headers: { 'x-auth-token': token }
            });
            // Toggle like in local state safely
            setPost(prev => {
                if (!prev) return null;
                const likes = prev.likes || [];
                const isLiked = likes.includes(currentUser._id);
                return {
                    ...prev,
                    likes: isLiked ? likes.filter(uid => uid !== currentUser._id) : [...likes, currentUser._id]
                };
            });
        } catch (err) {
            console.error('Error liking post:', err);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        setSubmittingComment(true);
        setSubmittingComment(true);
        try {
            const res = await axios.put(`/api/posts/${id}/comment`,
                { text: comment },
                {
                    headers: { 'x-auth-token': token }
                });
            setPost(prev => ({
                ...prev,
                comments: [...(prev.comments || []), res.data]
            }));
            setComment('');
            toast.success('Comment added!');
        } catch (err) {
            console.error('Error adding comment:', err);
            toast.error('Failed to add comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleSave = async () => {
        if (!post) return;
        try {
            await axios.put(`/api/users/${currentUser._id}/save/${post._id}`, {}, {
                headers: { 'x-auth-token': token }
            });
            setIsSaved(!isSaved);

            // Update localStorage user to keep it in sync
            const localUser = JSON.parse(localStorage.getItem("user"));
            if (localUser) {
                if (!isSaved) {
                    localUser.savedPosts = [...(localUser.savedPosts || []), post._id];
                } else {
                    localUser.savedPosts = (localUser.savedPosts || []).filter(pid => pid !== post._id);
                }
                localStorage.setItem("user", JSON.stringify(localUser));
            }
            toast.success(!isSaved ? 'Post saved' : 'Post unsaved');
        } catch (err) {
            console.error('Error saving post:', err);
            toast.error('Failed to save post');
        }
    };

    const handleDownload = async () => {
        if (!post) return;

        const mediaUrl = post.media?.[0] || post.image;
        if (!mediaUrl) {
            toast.error("No media to download");
            return;
        }

        try {
            // 1. Trigger File Download
            const response = await fetch(mediaUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            // Extract filename or default
            const ext = mediaUrl.split('.').pop().split(/[\?#]/)[0] || 'jpg';
            link.download = `sociosphere_${post._id}.${ext}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

            // 2. Save to LocalStorage History
            const downloadRecord = {
                id: post._id,
                mediaUrl: mediaUrl,
                type: isVideo(mediaUrl) ? 'video' : 'image',
                username: getUserName(post.userId),
                userAvatar: getUserAvatar(post.userId),
                downloadedAt: new Date().toISOString()
            };

            const existingDownloads = JSON.parse(localStorage.getItem('downloadedItems') || '[]');
            // Avoid duplicates
            if (!existingDownloads.some(item => item.id === post._id)) {
                localStorage.setItem('downloadedItems', JSON.stringify([downloadRecord, ...existingDownloads]));
            }

            toast.success("Download started");

        } catch (err) {
            console.error("Download failed:", err);
            toast.error("Failed to download media");
        }
    };

    // Helper to safely get user avatar
    const getUserAvatar = (userObj) => {
        if (userObj && typeof userObj === 'object' && userObj.profilePicture) {
            return userObj.profilePicture;
        }
        return '/assets/person/noAvatar.png';
    };

    // Helper to safely get username
    const getUserName = (userObj) => {
        if (userObj && typeof userObj === 'object' && userObj.username) {
            return userObj.username;
        }
        return 'Unknown User';
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
                <CircularProgress color="inherit" />
            </Box>
        );
    }

    if (!post) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
                <Typography sx={{ color: 'text.primary' }}>Post not found or deleted.</Typography>
            </Box>
        );
    }

    const likesCount = post.likes ? post.likes.length : 0;
    const isLiked = post.likes ? post.likes.includes(currentUser._id) : false;
    const hasMedia = (post.media && Array.isArray(post.media) && post.media.length > 0);
    const hasImage = !!post.image; // Legacy check
    const showMediaSection = hasMedia || hasImage;
    const mediaSrc = hasMedia ? post.media[0] : post.image;

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', color: 'text.primary', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: 1, borderColor: 'divider', gap: 2 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ color: 'text.primary' }}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Post</Typography>
            </Box>

            {/* Main Content - Centered Single Column Vertical Layout */}
            <Box sx={{
                flex: 1,
                maxWidth: '600px',
                width: '100%',
                mx: 'auto',
                p: { xs: 0, md: 3 },
                display: 'flex',
                flexDirection: 'column',
                gap: 2
            }}>

                {/* 1. User Info Header */}
                <Box sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={getUserAvatar(post.userId)} sx={{ width: 40, height: 40 }} />
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {getUserName(post.userId)}
                        </Typography>
                        {post.location && (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{post.location}</Typography>
                        )}
                    </Box>
                </Box>

                {/* 2. Media Section */}
                {showMediaSection && (
                    <Box sx={{
                        width: '100%',
                        bgcolor: 'black', // Keep media bg black for cinematic feel
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                        overflow: 'hidden',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '200px'
                    }}>
                        {isVideo(mediaSrc) ? (
                            <Box
                                component="video"
                                src={mediaSrc}
                                controls
                                autoPlay
                                loop
                                sx={{
                                    width: '100%',
                                    maxHeight: '600px',
                                    objectFit: 'contain'
                                }}
                            />
                        ) : (
                            <Box
                                component="img"
                                src={mediaSrc}
                                alt="Post"
                                sx={{
                                    width: '100%',
                                    maxHeight: '600px',
                                    objectFit: 'contain'
                                }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        )}
                    </Box>
                )}

                {/* 3. Actions - Directly below post */}
                <Box sx={{ px: 1 }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                        <IconButton onClick={handleLike} sx={{ color: isLiked ? '#ed4956' : 'text.primary', p: 0 }}>
                            {isLiked ? <Favorite /> : <FavoriteBorder />}
                        </IconButton>
                        <IconButton sx={{ color: 'text.primary', p: 0 }}>
                            <ChatBubbleOutline />
                        </IconButton>
                        <IconButton onClick={handleSave} sx={{ color: 'text.primary', ml: 'auto', p: 0 }}>
                            {isSaved ? <Bookmark /> : <BookmarkBorder />}
                        </IconButton>
                        <IconButton onClick={handleDownload} sx={{ color: 'text.primary', p: 0 }}>
                            <Download />
                        </IconButton>
                    </Box>
                    <Typography sx={{ fontWeight: 700, mb: 1 }}>{likesCount} likes</Typography>
                </Box>

                {/* 4. Caption & Comments */}
                <Box sx={{ px: 1 }}>
                    {/* Caption */}
                    {post.text && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2">
                                <span style={{ fontWeight: 700, marginRight: '8px' }}>
                                    {getUserName(post.userId)}
                                </span>
                                {post.text}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                                {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                            </Typography>
                        </Box>
                    )}

                    {/* Comments List */}
                    <Box sx={{ maxHeight: '300px', overflowY: 'auto', mb: 2 }}>
                        {post.comments && post.comments.map((c, i) => (
                            <Box key={i} sx={{ mb: 1, display: 'flex', gap: 2 }}>
                                <Typography variant="body2">
                                    <span style={{ fontWeight: 700, marginRight: '8px' }}>
                                        {c.username || 'User'}
                                    </span>
                                    {c.text}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Input */}
                    <Box component="form" onSubmit={handleComment} sx={{ display: 'flex', alignItems: 'center', opacity: submittingComment ? 0.5 : 1, py: 2, borderTop: 1, borderColor: 'divider' }}>
                        <TextField
                            fullWidth
                            placeholder="Add a comment..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            variant="standard"
                            InputProps={{ disableUnderline: true }}
                            sx={{ input: { color: 'text.primary' } }}
                        />
                        <Button type="submit" disabled={!comment.trim() || submittingComment} sx={{ color: 'primary.main', fontWeight: 600 }}>
                            Post
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default PostDetail;
