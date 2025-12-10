import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, Button, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Rightbar = () => {
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser, token } = useAuth();

    useEffect(() => {
        const fetchSuggestedUsers = async () => {
            try {
                const res = await axios.get('/api/users/suggested', {
                    headers: { 'x-auth-token': token }
                });
                setSuggestedUsers(res.data);
            } catch (err) {
                console.error("Error fetching suggested users:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSuggestedUsers();
    }, [token]);

    const handleFollow = async (userId) => {
        try {
            await axios.put(`/api/users/${userId}/follow`, {}, {
                headers: { 'x-auth-token': token }
            });
            // Remove the followed user from the list
            setSuggestedUsers(prev => prev.filter(user => user._id !== userId));
        } catch (err) {
            console.error("Error following user:", err);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={20} color="inherit" />
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            {/* Suggestions List - Vertical */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {suggestedUsers.length > 0 ? (
                    suggestedUsers.slice(0, 5).map((user) => (
                        <Box key={user._id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Link to={`/profile/${user.username}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Avatar
                                    src={user.profilePicture || "/assets/person/noAvatar.png"}
                                    sx={{ width: 40, height: 40 }}
                                />
                                <Box>
                                    <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '14px' }}>
                                        {user.username}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '12px' }}>
                                        {user.fullName}
                                    </Typography>
                                </Box>
                            </Link>
                            <Button
                                onClick={() => handleFollow(user._id)}
                                sx={{
                                    textTransform: 'none',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: 'primary.main',
                                    padding: 0,
                                    minWidth: 'auto',
                                    '&:hover': { color: 'text.primary' }
                                }}
                            >
                                Follow
                            </Button>
                        </Box>
                    ))
                ) : (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>No suggestions available.</Typography>
                )}
            </Box>
        </Box>
    );
};

export default Rightbar;
