import React, { useState, useEffect } from 'react';
import { MoreVert, Favorite, FavoriteBorder, ChatBubbleOutline, Send, BookmarkBorder, Bookmark } from '@mui/icons-material';
import { Box, Card, CardHeader, CardMedia, CardContent, CardActions, Avatar, IconButton, Typography, InputBase, Menu, MenuItem } from '@mui/material';
import { format } from 'timeago.js';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Post({ post, onUnsave }) {
    const { user: currentUser, token } = useAuth();
    const [comments, setComments] = useState(post.comments || []);
    const [commentText, setCommentText] = useState("");
    const [author, setAuthor] = useState(null);

    // Validations
    const initialLikes = post.likes || [];
    const [like, setLike] = useState(initialLikes.length);
    const [isLiked, setIsLiked] = useState(currentUser ? initialLikes.includes(currentUser._id) : false);

    // Saved state
    const [isSaved, setIsSaved] = useState(currentUser?.savedPosts?.includes(post._id) || false);

    // Menu state
    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    useEffect(() => {
        // Handle post.userId being either an ID string or a populated object
        if (post.userId) {
            if (typeof post.userId === 'object' && post.userId.username) {
                // Already populated object
                setAuthor(post.userId);
            } else if (typeof post.userId === 'string') {
                // Check if it's the logged in user
                if (currentUser && post.userId === currentUser._id) {
                    setAuthor(currentUser);
                    return;
                }

                // ID string, need to fetch
                const fetchUser = async () => {
                    try {
                        const res = await axios.get(`/api/users/${post.userId}`);
                        setAuthor(res.data);
                    } catch (err) {
                        console.error("Failed to fetch post author", err);
                        // If 404/500, fallback to Unknown but try to preserve ID
                        setAuthor({ _id: post.userId, username: "Unknown", profilePicture: "" });
                    }
                };
                fetchUser();
            } else {
                // Fallback
                setAuthor({ username: "Unknown", profilePicture: "" });
            }
        }
    }, [post.userId]);

    const likeHandler = async () => {
        try {
            await axios.put("/api/posts/" + post._id + "/like", {}, {
                headers: { 'x-auth-token': token }
            });
            setLike(isLiked ? like - 1 : like + 1);
            setIsLiked(!isLiked);
        } catch (err) {
            console.error(err);
        }
    };

    const handleComment = async () => {
        if (!commentText.trim()) return;
        try {
            const res = await axios.post(`/api/posts/${post._id}/comment`, {
                text: commentText
            }, {
                headers: { 'x-auth-token': token }
            });
            setComments([...comments, res.data]);
            setCommentText("");
            toast.success("Comment added");
        } catch (err) {
            console.error(err);
            toast.error("Failed to comment");
        }
    };

    const saveHandler = async () => {
        try {
            await axios.put(`/api/users/${currentUser._id}/save/${post._id}`, {}, {
                headers: { 'x-auth-token': token }
            });

            const newSavedState = !isSaved;
            setIsSaved(newSavedState);

            const localUser = JSON.parse(localStorage.getItem("user"));
            if (localUser) {
                if (newSavedState) {
                    localUser.savedPosts = [...(localUser.savedPosts || []), post._id];
                } else {
                    localUser.savedPosts = (localUser.savedPosts || []).filter(id => id !== post._id);
                }
                localStorage.setItem("user", JSON.stringify(localUser));
            }
            toast.success(newSavedState ? "Post saved" : "Post unsaved");
        } catch (err) {
            console.error(err);
            toast.error("Failed to save action");
        }
    };

    const handleUnsave = () => {
        saveHandler();
        handleMenuClose();
        if (onUnsave) {
            onUnsave(); // Trigger removal from list
        }
    };

    const navigate = useNavigate();
    const handlePostClick = () => {
        navigate(`/post/${post._id}`);
    };

    // If no author yet, show skeleton or null (prevent crash)
    if (!author) {
        return null;
    }

    return (
        <Card sx={{ maxWidth: '100%', mb: 2, borderRadius: 2, bgcolor: 'black', color: 'white', border: '1px solid #262626' }}>
            <CardHeader
                avatar={
                    <Link to={`/profile/${author.username}`}>
                        <Avatar
                            src={author.profilePicture || "/assets/person/noAvatar.png"}
                            aria-label="recipe"
                            sx={{ width: 32, height: 32 }}
                        />
                    </Link>
                }
                action={
                    <>
                        <IconButton
                            aria-label="settings"
                            sx={{ color: 'white' }}
                            onClick={handleMenuClick}
                        >
                            <MoreVert />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={openMenu}
                            onClose={handleMenuClose}
                            PaperProps={{
                                sx: {
                                    bgcolor: '#262626',
                                    color: 'white',
                                    '& .MuiMenuItem-root': {
                                        '&:hover': {
                                            bgcolor: '#333',
                                        },
                                    },
                                }
                            }}
                        >
                            {isSaved && <MenuItem onClick={handleUnsave}>Unsave</MenuItem>}
                        </Menu>
                    </>
                }
                title={
                    <Link to={`/profile/${author.username}`} style={{ textDecoration: 'none', color: 'white', fontWeight: 600 }}>
                        {author.username}
                    </Link>
                }
                subheader={
                    <Typography variant="caption" sx={{ color: '#a8a8a8' }}>
                        {format(post.createdAt)}
                    </Typography>
                }
                sx={{ py: 1.5 }}
            />

            {/* Media Section */}
            {post.media && post.media.length > 0 && (
                <Box onClick={handlePostClick} sx={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', bgcolor: '#000' }}>
                    <CardMedia
                        component="img"
                        image={post.media[0]}
                        alt="Post image"
                        sx={{ width: '100%', maxHeight: '600px', objectFit: 'contain' }}
                    />
                </Box>
            )}

            {/* Fallback legacy image */}
            {!post.media?.length && post.image && (
                <Box onClick={handlePostClick} sx={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', bgcolor: '#000' }}>
                    <CardMedia
                        component="img"
                        image={post.image}
                        alt="Post image"
                        sx={{ width: '100%', maxHeight: '600px', objectFit: 'contain' }}
                    />
                </Box>
            )}

            <CardActions disableSpacing sx={{ pt: 1, pb: 0 }}>
                <IconButton onClick={likeHandler} sx={{ color: isLiked ? '#ed4956' : 'white' }}>
                    {isLiked ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
                <IconButton onClick={handlePostClick} sx={{ color: 'white' }}>
                    <ChatBubbleOutline />
                </IconButton>
                <IconButton sx={{ color: 'white', transform: 'rotate(-45deg)', mb: 0.5 }}>
                    <Send />
                </IconButton>
                <Box sx={{ flexGrow: 1 }} />
                <IconButton onClick={saveHandler} sx={{ color: 'white' }}>
                    {isSaved ? <Bookmark /> : <BookmarkBorder />}
                </IconButton>
            </CardActions>

            <CardContent sx={{ pt: 1, pb: 2, cursor: 'pointer' }} onClick={handlePostClick}>
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'white' }}>
                        {like} likes
                    </Typography>

                    {post.text && (
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            <Typography variant="body2" sx={{ color: 'white' }}>
                                <span style={{ fontWeight: 600, marginRight: '8px' }}>{author.username}</span>
                                {post.text}
                            </Typography>
                        </Box>
                    )}

                    {comments.length > 0 && (
                        <Typography variant="body2" sx={{ cursor: 'pointer', mb: 1, color: '#a8a8a8' }}>
                            View all {comments.length} comments
                        </Typography>
                    )}

                    {comments.slice(-2).map((c, i) => (
                        <Typography key={i} variant="body2" sx={{ mb: 0.5, color: 'white' }}>
                            <span style={{ fontWeight: 600, marginRight: '8px' }}>{c.username || 'User'}</span>
                            {c.text}
                        </Typography>
                    ))}
                </Box>

                <Box
                    onClick={(e) => e.stopPropagation()}
                    sx={{ display: 'flex', alignItems: 'center', mt: 1, borderTop: '1px solid #262626', pt: 2 }}
                >
                    <InputBase
                        sx={{ ml: 1, flex: 1, fontSize: '0.9rem', color: 'white' }}
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleComment();
                        }}
                    />
                    <Typography
                        variant="button"
                        onClick={handleComment}
                        sx={{ color: '#0095f6', textTransform: 'none', fontWeight: 600, cursor: 'pointer', opacity: commentText.trim() ? 1 : 0.5 }}
                    >
                        Post
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}
