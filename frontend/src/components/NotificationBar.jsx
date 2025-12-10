import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton, Badge, List, ListItem, ListItemAvatar, Avatar, ListItemText, CircularProgress } from '@mui/material';
import { Notifications, Minimize } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NotificationBar = () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const containerRef = useRef(null);

    // Fetch notifications
    const fetchNotifications = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await axios.get('/api/notifications', {
                headers: { 'x-auth-token': token }
            });
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchNotifications();
        } else {
            if (token) fetchNotifications();
        }
    }, [open, token]);

    const handleToggle = () => {
        setOpen(!open);
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            try {
                await axios.put(`/api/notifications/${notification._id}`, {}, {
                    headers: { 'x-auth-token': token }
                });
                // Update local state
                setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (err) {
                console.error("Error marking notification read:", err);
            }
        }

        // Navigate based on type
        if (notification.type === 'follow') {
            navigate(`/profile/${notification.sender.username}`);
        } else if (notification.post) {
            navigate(`/`);
        }
    };

    if (!user) return null;

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                zIndex: 1300,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
            }}
            ref={containerRef}
        >
            {/* The List Container (Expanded) */}
            {open && (
                <Box
                    sx={{
                        width: 300,
                        maxHeight: 400,
                        bgcolor: '#262626',
                        border: '1px solid #363636',
                        borderRadius: '12px',
                        mb: 1,
                        overflow: 'hidden',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <Box sx={{ p: 2, borderBottom: '1px solid #363636', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'white' }}>Notifications</Typography>
                        <IconButton size="small" onClick={handleToggle} sx={{ color: '#a8a8a8' }}>
                            <Minimize />
                        </IconButton>
                    </Box>

                    <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                <CircularProgress size={24} sx={{ color: 'white' }} />
                            </Box>
                        ) : notifications.length > 0 ? (
                            <List disablePadding>
                                {notifications.map((notification) => (
                                    <ListItem
                                        key={notification._id}
                                        button
                                        onClick={() => handleNotificationClick(notification)}
                                        sx={{
                                            bgcolor: notification.isRead ? 'transparent' : 'rgba(0, 149, 246, 0.1)',
                                            '&:hover': { bgcolor: '#1c1c1c' },
                                            borderBottom: '1px solid #363636',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar src={notification.sender?.profilePicture || "/assets/person/noAvatar.png"} />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body2" sx={{ color: 'white', fontWeight: notification.isRead ? 400 : 600 }}>
                                                    <span style={{ fontWeight: 'bold' }}>{notification.sender?.username}</span> {notification.text}
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography variant="caption" sx={{ color: '#a8a8a8' }}>
                                                    {new Date(notification.createdAt).toLocaleDateString()}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Box sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" sx={{ color: '#a8a8a8' }}>No notifications yet.</Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            )}

            {/* The Button (Collapsed/Toggle) */}
            <Box
                onClick={handleToggle}
                sx={{
                    bgcolor: '#262626',
                    color: 'white',
                    px: 2,
                    py: 1.5,
                    borderRadius: '50px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    border: '1px solid #363636',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    transition: 'all 0.2s',
                    '&:hover': {
                        bgcolor: '#363636',
                        transform: 'translateY(-2px)'
                    }
                }}
            >
                <Badge badgeContent={unreadCount} color="error">
                    <Notifications sx={{ color: 'white' }} />
                </Badge>
                {!open && (
                    <Typography variant="subtitle2" fontWeight="600" sx={{ display: { xs: 'none', sm: 'block' } }}>
                        Notifications
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default NotificationBar;
