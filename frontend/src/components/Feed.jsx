// frontend/src/components/Feed.jsx
import React, { useState, useEffect } from 'react';
import { Box, Card, CardHeader, CardMedia, CardContent, CardActions, Avatar, IconButton, Typography, CircularProgress, Skeleton } from '@mui/material';
import { FavoriteBorder, Favorite, ChatBubbleOutline, Send, BookmarkBorder, MoreHoriz } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { makeRequest } from '../axios';

export default function Feed() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, token } = useAuth();

    useEffect(() => {
        const fetchPosts = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await makeRequest.get('/posts/timeline');
                setPosts(res.data || []);
            } catch (err) {
                console.error('Error fetching posts:', err);
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [token]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[1, 2, 3].map(i => (
                    <Card key={i} sx={{ bgcolor: 'background.default', border: 1, borderColor: 'divider', borderRadius: '8px' }}>
                        <CardHeader
                            avatar={<Skeleton variant="circular" width={32} height={32} />}
                            title={<Skeleton width={100} />}
                        />
                        <Skeleton variant="rectangular" height={400} />
                    </Card>
                ))}
            </Box>
        );
    }

    if (!posts || posts.length === 0) {
        return (
            <Box sx={{
                textAlign: 'center',
                py: 8,
                color: 'text.secondary',
                bgcolor: 'background.default',
                border: 1,
                borderColor: 'divider',
                borderRadius: '8px'
            }}>
                <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>Welcome to Soci∞rbit</Typography>
                <Typography variant="body2">
                    When you follow people, you&apos;ll see the photos and videos they post here.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {posts.map((post) => (
                <Card key={post._id} sx={{
                    bgcolor: 'background.default',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: '8px',
                    color: 'text.primary'
                }}>
                    <CardHeader
                        avatar={
                            <Avatar
                                src={post.user?.profilePicture || '/assets/person/noAvatar.png'}
                                sx={{ width: 32, height: 32 }}
                            />
                        }
                        action={
                            <IconButton sx={{ color: 'text.primary' }}>
                                <MoreHoriz />
                            </IconButton>
                        }
                        title={
                            <Typography sx={{ fontWeight: 600, fontSize: '14px', color: 'text.primary' }}>
                                {post.user?.username || 'user'}
                            </Typography>
                        }
                        subheader={
                            <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
                                {post.location || ''}
                            </Typography>
                        }
                        sx={{ py: 1, px: 1.5 }}
                    />

                    {post.img && (
                        <CardMedia
                            component="img"
                            image={post.img}
                            alt="Post"
                            sx={{ maxHeight: 585, objectFit: 'cover' }}
                        />
                    )}

                    <CardActions sx={{ px: 1, py: 0.5 }}>
                        <IconButton sx={{ color: 'text.primary' }}>
                            <FavoriteBorder />
                        </IconButton>
                        <IconButton sx={{ color: 'text.primary' }}>
                            <ChatBubbleOutline />
                        </IconButton>
                        <IconButton sx={{ color: 'text.primary' }}>
                            <Send />
                        </IconButton>
                        <Box sx={{ flexGrow: 1 }} />
                        <IconButton sx={{ color: 'text.primary' }}>
                            <BookmarkBorder />
                        </IconButton>
                    </CardActions>

                    <CardContent sx={{ py: 0, px: 1.5 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '14px', mb: 0.5 }}>
                            {post.likes?.length || 0} likes
                        </Typography>
                        <Typography sx={{ fontSize: '14px' }}>
                            <Box component="span" sx={{ fontWeight: 600, mr: 0.5 }}>
                                {post.user?.username || 'user'}
                            </Box>
                            {post.desc}
                        </Typography>
                        <Typography sx={{ fontSize: '10px', color: 'text.secondary', mt: 1, textTransform: 'uppercase' }}>
                            {new Date(post.createdAt).toLocaleDateString()}
                        </Typography>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
}
