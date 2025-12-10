import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

    const handleLogout = () => {
        logout();
    };

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

                {/* Search Bar */}
                <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', bgcolor: 'action.hover', borderRadius: '8px', px: 2, py: 0.5, minWidth: '268px' }}>
                    <Search sx={{ color: 'text.secondary', mr: 1 }} />
                    <InputBase placeholder="Search" sx={{ flex: 1, color: 'text.primary' }} />
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
