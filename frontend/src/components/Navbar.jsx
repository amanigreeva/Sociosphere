import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { makeRequest } from '../axios';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    IconButton,
    Avatar,
    Badge,
    InputBase,
    Button
} from '@mui/material';
import {
    Home,
    Search,
    AddBox,
    Explore,
    FavoriteBorder,
    ChatBubbleOutline
} from '@mui/icons-material';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [query, setQuery] = React.useState("");
    const [searchResults, setSearchResults] = React.useState([]);
    const [showResults, setShowResults] = React.useState(false);

    const handleLogout = () => {
        logout();
    };

    const handleSearch = async (e) => {
        const searchText = e.target.value;
        setQuery(searchText);

        if (searchText.length > 0) {
            try {
                const res = await makeRequest.get(`/users/search?search=${searchText}`);
                setSearchResults(res.data);
                setShowResults(true);
            } catch (err) {
                console.error(err);
            }
        } else {
            setSearchResults([]);
            setShowResults(false);
        }
    };

    // ... re-implement return ...
    return (
        <AppBar position="fixed" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', maxWidth: '975px', width: '100%', margin: '0 auto', px: { xs: 1, md: 2 } }}>
                {/* Logo */}
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontFamily: '"Billabong", "Segoe UI", sans-serif',
                            fontSize: { xs: '1.5rem', md: '1.8rem' },
                            fontWeight: 'bold',
                            background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            cursor: 'pointer'
                        }}
                    >
                        SocioOrbit
                    </Typography>
                </Link>

                {/* Search Bar - RELATIVE POSITION for Dropdown */}
                <Box sx={{ position: 'relative', display: { xs: 'none', md: 'flex' }, alignItems: 'center', bgcolor: 'action.hover', borderRadius: '8px', px: 2, py: 0.5, minWidth: '268px' }}>
                    <Search sx={{ color: 'text.secondary', mr: 1 }} />
                    <InputBase
                        placeholder="Search"
                        sx={{ flex: 1, color: 'text.primary' }}
                        value={query}
                        onChange={handleSearch}
                        onBlur={() => setTimeout(() => setShowResults(false), 200)}
                        onFocus={() => { if (query.length > 0) setShowResults(true); }}
                    />

                    {/* Search Results Dropdown */}
                    {showResults && searchResults.length > 0 && (
                        <Box sx={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            width: '100%',
                            bgcolor: 'background.paper',
                            boxShadow: 3,
                            borderRadius: '0 0 8px 8px',
                            zIndex: 10,
                            mt: 1,
                            maxHeight: '300px',
                            overflowY: 'auto'
                        }}>
                            {searchResults.map((user) => (
                                <Box
                                    key={user._id}
                                    onClick={() => {
                                        navigate(`/profile/${user.username}`);
                                        setQuery("");
                                        setShowResults(false);
                                    }}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        p: 1.5,
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: 'action.hover' }
                                    }}
                                >
                                    <Avatar src={user.profilePicture || "/assets/person/noAvatar.png"} sx={{ width: 40, height: 40 }} />
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold">{user.username}</Typography>
                                        <Typography variant="caption" color="text.secondary">{user.name}</Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>

                {/* Navigation Icons */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1.5 } }}>
                    <IconButton component={Link} to="/" sx={{ color: 'text.primary' }}>
                        <Home />
                    </IconButton>
                    <IconButton component={Link} to="/chat" sx={{ color: 'text.primary' }}>
                        <Badge badgeContent={0} color="error">
                            <ChatBubbleOutline />
                        </Badge>
                    </IconButton>
                    <IconButton sx={{ color: 'text.primary' }}>
                        <AddBox />
                    </IconButton>
                    <IconButton component={Link} to="/explore" sx={{ color: 'text.primary' }}>
                        <Explore />
                    </IconButton>
                    <IconButton component={Link} to="/notifications" sx={{ color: 'text.primary' }}>
                        <Badge badgeContent={0} color="error">
                            <FavoriteBorder />
                        </Badge>
                    </IconButton>
                    <IconButton component={Link} to={`/profile/${user?.username || 'me'}`}>
                        <Avatar
                            src={user?.profilePicture || '/assets/person/noAvatar.png'}
                            sx={{ width: 28, height: 28, border: 1, borderColor: 'divider' }}
                        />
                    </IconButton>
                    <Button
                        onClick={handleLogout}
                        size="small"
                        sx={{ textTransform: 'none', display: { xs: 'none', md: 'block' }, color: 'primary.main' }}
                    >
                        Logout
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
