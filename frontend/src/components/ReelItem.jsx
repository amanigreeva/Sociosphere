import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Avatar, IconButton, TextField, Button } from '@mui/material';
import { Favorite, FavoriteBorder, ChatBubbleOutline, Send, Bookmark, BookmarkBorder, MusicNote, VolumeUp, VolumeOff, Close } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ReelItem = ({ post, isActive }) => {
    const { user: currentUser, token } = useAuth();
    const [liked, setLiked] = useState(post.likes.includes(currentUser?._id));
    const [likesCount, setLikesCount] = useState(post.likes.length);
    const [isSaved, setIsSaved] = useState(currentUser?.savedPosts?.includes(post._id));
    const [author, setAuthor] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);
    const [comment, setComment] = useState("");
    const videoRef = useRef(null);
    const navigate = useNavigate();

    const toggleMute = (e) => {
        e.stopPropagation();
        setIsMuted(!isMuted);
    };

    const handleFlip = (e) => {
        e.stopPropagation();
        setIsFlipped(!isFlipped);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        try {
            await axios.put(`/api/posts/${post._id}/comment`, { text: comment }, {
                headers: { 'x-auth-token': token }
            });
            post.comments.push({ username: currentUser.username, text: comment, profilePicture: currentUser.profilePicture });
            setComment("");
        } catch (err) {
            console.error("Failed to post comment", err);
        }
    };

    useEffect(() => {
        const fetchAuthor = async () => {
            if (post.userId) {
                try {
                    if (typeof post.userId === 'object') {
                        setAuthor(post.userId);
                    } else if (currentUser && post.userId === currentUser._id) {
                        // Optimization: If it's the logged-in user's post, use context data
                        setAuthor(currentUser);
                    } else {
                        const res = await axios.get(`/api/users/${post.userId}`);
                        setAuthor(res.data);
                    }
                } catch (err) {
                    console.error("Error loading reel author", err);
                    setAuthor({
                        _id: post.userId,
                        username: 'User',
                        profilePicture: '/assets/person/noAvatar.png'
                    });
                }
            }
        };
        fetchAuthor();
    }, [post.userId]);

    useEffect(() => {
        if (isActive && videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(e => console.log("Autoplay prevented", e));
        } else if (videoRef.current) {
            videoRef.current.pause();
        }
    }, [isActive]);

    const handleLike = async () => {
        try {
            await axios.put(`/api/posts/${post._id}/like`, {}, {
                headers: { 'x-auth-token': token }
            });
            setLiked(!liked);
            setLikesCount(liked ? likesCount - 1 : likesCount + 1);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async () => {
        try {
            await axios.put(`/api/users/${currentUser._id}/save/${post._id}`, {}, {
                headers: { 'x-auth-token': token }
            });
            setIsSaved(!isSaved);

            let updatedUser = JSON.parse(localStorage.getItem("user"));
            if (updatedUser) {
                if (!isSaved) {
                    updatedUser.savedPosts = [...(updatedUser.savedPosts || []), post._id];
                } else {
                    updatedUser.savedPosts = updatedUser.savedPosts?.filter(id => id !== post._id);
                }
                localStorage.setItem("user", JSON.stringify(updatedUser));
            }
            toast.success(isSaved ? "Reel unsaved" : "Reel saved");
        } catch (err) {
            console.error(err);
            toast.error("Failed to save reel");
        }
    };

    if (!author) return null;

    const mediaSrc = (post.media && post.media.length > 0) ? post.media[0] : post.image;

    return (
        <Box sx={{
            position: 'relative',
            width: '100%',
            height: '100vh',
            bgcolor: '#000',
            scrollSnapAlign: 'start',
            perspective: '1000px', // key for 3D
            overflow: 'hidden'
        }}>
            {/* Flipper Container */}
            <Box sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                transition: 'transform 0.8s',
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}>

                {/* FRONT FACE: Current Video Player */}
                <Box sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    bgcolor: '#000'
                }}>
                    {/* Video Background */}
                    <Box
                        component="video"
                        ref={videoRef}
                        src={mediaSrc}
                        poster={post.image}
                        loop
                        muted={isMuted}
                        playsInline
                        onClick={(e) => e.target.paused ? e.target.play() : e.target.pause()}
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            maxHeight: '100vh',
                            bgcolor: '#000',
                            cursor: 'pointer'
                        }}
                    />

                    {/* Mute Toggle Overlay */}
                    <Box
                        onClick={toggleMute}
                        sx={{
                            position: 'absolute',
                            top: 20,
                            right: 20,
                            zIndex: 10,
                            cursor: 'pointer',
                            bgcolor: 'rgba(0,0,0,0.5)',
                            borderRadius: '50%',
                            p: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {isMuted ? <VolumeOff sx={{ color: 'white' }} /> : <VolumeUp sx={{ color: 'white' }} />}
                    </Box>

                    {/* Overlay Content Wrapper */}
                    <Box sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        pb: 2
                    }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'space-between',
                            px: 2,
                            pb: 4,
                            pointerEvents: 'auto'
                        }}>
                            {/* Left: Author Info & Caption */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxWidth: '80%' }}>
                                <Box
                                    sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
                                    onClick={() => navigate(`/profile/${author.username}`)}
                                >
                                    <Avatar src={author.profilePicture} sx={{ width: 40, height: 40, border: '1px solid rgba(255,255,255,0.5)' }} />
                                    <Typography variant="subtitle1" fontWeight="bold" color="white" sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                                        {author.username}
                                    </Typography>
                                    {currentUser?._id !== author._id && (
                                        <Box sx={{
                                            border: '1px solid white',
                                            borderRadius: '4px',
                                            px: 1,
                                            py: 0.2,
                                            cursor: 'pointer',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                                        }}>
                                            <Typography variant="caption" fontWeight="bold" color="white">Follow</Typography>
                                        </Box>
                                    )}
                                </Box>

                                <Typography variant="body2" color="white" sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)', mb: 1 }}>
                                    {post.text}
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <MusicNote sx={{ fontSize: 16, color: 'white' }} />
                                    <Typography variant="caption" color="white">Original Audio</Typography>
                                </Box>
                            </Box>

                            {/* Right: Action Buttons */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <IconButton onClick={handleLike} sx={{ p: 0, mb: 0.5 }}>
                                        {liked ? <Favorite sx={{ fontSize: 32, fill: 'red' }} /> : <FavoriteBorder sx={{ fontSize: 32, color: 'white' }} />}
                                    </IconButton>
                                    <Typography variant="caption" fontWeight="bold" color="white">{likesCount}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <IconButton onClick={handleFlip} sx={{ p: 0, mb: 0.5 }}>
                                        <ChatBubbleOutline sx={{ fontSize: 32, color: 'white' }} />
                                    </IconButton>
                                    <Typography variant="caption" fontWeight="bold" color="white">{post.comments?.length || 0}</Typography>
                                </Box>



                                <IconButton onClick={handleSave} sx={{ p: 0 }}>
                                    {isSaved ? <Bookmark sx={{ fontSize: 32, color: 'white' }} /> : <BookmarkBorder sx={{ fontSize: 32, color: 'white' }} />}
                                </IconButton>

                                <Box sx={{
                                    width: 30,
                                    height: 30,
                                    border: '2px solid white',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                    mt: 1
                                }}>
                                    <img src={author.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* BACK FACE: Comments Section */}
                <Box sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    bgcolor: '#121212',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 2
                }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, borderBottom: '1px solid #333', pb: 1 }}>
                        <Typography variant="h6" color="white">Comments</Typography>
                        <IconButton onClick={handleFlip}>
                            <Close sx={{ color: 'white' }} />
                        </IconButton>
                    </Box>

                    {/* Comments List */}
                    <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
                        {post.comments && post.comments.length > 0 ? (
                            post.comments.map((c, i) => (
                                <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <Avatar src={c.profilePicture || '/assets/person/noAvatar.png'} sx={{ width: 32, height: 32 }} />
                                    <Box>
                                        <Typography variant="caption" fontWeight="bold" color="white" sx={{ mr: 1 }}>{c.username}</Typography>
                                        <Typography variant="body2" color="gray">{c.text}</Typography>
                                    </Box>
                                </Box>
                            ))
                        ) : (
                            <Typography color="gray" textAlign="center" mt={4}>No comments yet. Be the first!</Typography>
                        )}
                    </Box>

                    {/* Input */}
                    <Box component="form" onSubmit={handleCommentSubmit} sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Add a comment..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            sx={{
                                input: { color: 'white' },
                                fieldset: { borderColor: '#333' },
                                '&:hover fieldset': { borderColor: '#555' }
                            }}
                            size="small"
                        />
                        <Button type="submit" variant="contained" disabled={!comment.trim()} sx={{ bgcolor: '#0095f6' }}>Post</Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default ReelItem;
