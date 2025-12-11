import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, CircularProgress, Alert, Button } from '@mui/material';
import { makeRequest } from '../axios';
import { useAuth } from '../context/AuthContext';
import { format } from 'timeago.js';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token, user: currentUser, updateUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await makeRequest.get('/notifications');
                setNotifications(res.data);
            } catch (err) {
                console.error("Error fetching notifications:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, [token]);

    const handleFollowBack = async (senderId) => {
        try {
            await makeRequest.put(`/users/${senderId}/follow`, {});
            // Update local user state to reflect following
            const updatedFollowing = [...currentUser.following, senderId];
            updateUser({ ...currentUser, following: updatedFollowing });
        } catch (err) {
            console.error("Error following back:", err);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>Notifications</Typography>
            {notifications.length === 0 ? (
                <Alert severity="info" sx={{ bgcolor: 'transparent', color: 'text.primary' }}>No notifications yet</Alert>
            ) : (
                <List>
                    {notifications.map((n) => {
                        const isFollowing = currentUser?.following.includes(n.sender?._id);
                        const isFollowType = n.type === 'follow';

                        return (
                            <ListItem key={n._id} alignItems="flex-start" sx={{ mb: 1, bgcolor: n.isRead ? 'transparent' : 'action.hover', borderRadius: 1 }}>
                                <ListItemAvatar onClick={() => navigate(`/profile/${n.sender?.username}`)} sx={{ cursor: 'pointer' }}>
                                    <Avatar alt={n.sender?.username} src={n.sender?.profilePicture || "/assets/person/noAvatar.png"} />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle2" component="span" fontWeight="bold">
                                            {n.sender?.username}
                                        </Typography>
                                    }
                                    secondary={
                                        <React.Fragment>
                                            <Typography
                                                component="span"
                                                variant="body2"
                                                color="text.primary"
                                            >
                                                {" " + n.text.replace(n.sender?.username, "").replace(" U can FollowBack", "").trim()}
                                            </Typography>
                                            <Typography variant="caption" display="block" color="text.secondary">
                                                {format(n.createdAt)}
                                            </Typography>
                                        </React.Fragment>
                                    }
                                />
                                {isFollowType && (
                                    <Box sx={{ ml: 2 }}>
                                        {isFollowing ? (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                disabled
                                                sx={{
                                                    textTransform: 'none',
                                                    color: 'text.secondary',
                                                    borderColor: 'text.disabled'
                                                }}
                                            >
                                                Following
                                            </Button>
                                        ) : (
                                            <Button
                                                size="small"
                                                variant="contained"
                                                onClick={() => handleFollowBack(n.sender?._id)}
                                                sx={{
                                                    textTransform: 'none',
                                                    boxShadow: 'none',
                                                    '&:hover': { boxShadow: 'none' },
                                                    bgcolor: '#0095f6',
                                                    '&:active': { bgcolor: '#0074cc' }
                                                }}
                                            >
                                                Follow Back
                                            </Button>
                                        )}
                                    </Box>
                                )}
                            </ListItem>
                        );
                    })}
                </List>
            )}
        </Box>
    );
}
