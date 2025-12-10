import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, InputAdornment, CircularProgress } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Search = () => {
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const { token } = useAuth();
    const navigate = useNavigate();

    // Debounced search
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (query.trim()) {
                searchUsers(query);
            } else {
                setUsers([]);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(delaySearch);
    }, [query]);

    const searchUsers = async (searchQuery) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/users/search?search=${searchQuery}`, {
                headers: { 'x-auth-token': token }
            });
            setUsers(res.data);
        } catch (err) {
            console.error('Error searching users:', err);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = (username) => {
        navigate(`/profile/${username}`);
    };

    return (
        <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh', color: 'text.primary' }}>
            <Sidebar />
            <Box sx={{ flex: 1, marginLeft: '72px', p: 4, display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ width: '100%', maxWidth: 600 }}>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Search</Typography>

                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search users..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            endAdornment: loading && (
                                <InputAdornment position="end">
                                    <CircularProgress size={20} color="inherit" />
                                </InputAdornment>
                            ),
                            sx: {
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                                '& input': { color: 'text.primary' },
                                '& fieldset': { borderColor: 'divider' },
                                '&:hover fieldset': { borderColor: 'text.secondary' },
                                '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                            }
                        }}
                        sx={{ mb: 3 }}
                    />

                    {query && (
                        <>
                            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                                {users.length} {users.length === 1 ? 'result' : 'results'} for "{query}"
                            </Typography>
                            <List sx={{ bgcolor: 'background.default' }}>
                                {users.length > 0 ? users.map(user => (
                                    <ListItem
                                        key={user._id}
                                        onClick={() => handleUserClick(user.username)}
                                        sx={{
                                            cursor: 'pointer',
                                            borderRadius: 2,
                                            mb: 1,
                                            '&:hover': { bgcolor: 'action.hover' },
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar src={user.profilePicture || '/assets/person/noAvatar.png'}>
                                                {user.username[0].toUpperCase()}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={user.username}
                                            secondary={user.name}
                                            primaryTypographyProps={{ color: 'text.primary', fontWeight: 600 }}
                                            secondaryTypographyProps={{ color: 'text.secondary' }}
                                        />
                                    </ListItem>
                                )) : !loading && (
                                    <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
                                        No users found
                                    </Typography>
                                )}
                            </List>
                        </>
                    )}

                    {!query && (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                                Search for users
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                                Start typing to find people
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default Search;

