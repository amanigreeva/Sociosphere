// frontend/src/components/Sidebar.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import Logo from './Logo';
import axios from 'axios';
import SettingsModal from './SettingsModal';
import ReportProblemModal from './ReportProblemModal';
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem,
    Badge,
    useTheme
} from '@mui/material';
import {
    Home,
    Search,
    BarChart,
    OndemandVideo,
    ChatBubbleOutline,
    AddBox,
    Person,
    Menu as MenuIcon,
    Settings,
    Bookmark,
    NightsStay,
    ReportProblem,
    Logout,
    SmartToy, // Import SmartToy icon
    LiveTv
} from '@mui/icons-material';

const Sidebar = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [totalUnread, setTotalUnread] = useState(0);
    const { user, token, logout } = useAuth();
    const { dispatch } = useContext(ThemeContext);
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();

    // Fetch total unread count
    useEffect(() => {
        const fetchUnreadCount = async () => {
            if (!user?._id || !token) return;
            try {
                const res = await axios.get(`/api/conversations/${user._id}`, {
                    headers: { 'x-auth-token': token }
                });
                const conversations = res.data;
                let total = 0;
                conversations.forEach(c => {
                    if (c.unreadCount && c.unreadCount[user._id]) {
                        total += c.unreadCount[user._id];
                    }
                });
                setTotalUnread(total);
            } catch (err) {
                console.error('Error fetching unread count:', err);
            }
        };

        fetchUnreadCount();
        // Refresh every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [user?._id, token]);

    const navItems = [
        { text: 'Home', icon: <Home />, path: '/' },
        { text: 'Search', icon: <Search />, path: '/search' },
        { text: 'Analytics', icon: <BarChart />, path: '/analytics' },
        { text: 'Reels', icon: <OndemandVideo />, path: '/reels' },
        { text: 'Messages', icon: <ChatBubbleOutline />, path: '/chat', badge: totalUnread },
        { text: 'Create', icon: <AddBox />, path: '/create' },

        { text: 'Ask AI', icon: <SmartToy />, action: 'ask_ai', color: '#8e24aa' }, // Added Ask AI item
        { text: 'Profile', icon: <Person />, path: `/profile/${user?.username || 'me'}`, avatar: true }
    ];

    const moreItems = [
        { text: 'Settings', icon: <Settings />, action: 'settings' },
        { text: 'Your Activity', icon: <BarChart />, path: '/activity' }, // Added Activity
        { text: 'Saved', icon: <Bookmark />, path: '/saved' },
        { text: 'Switch Theme', icon: <NightsStay />, action: 'theme' },
        { text: 'Report a problem', icon: <ReportProblem />, action: 'report' },
        { text: 'Log out', icon: <Logout />, action: 'logout' }
    ];

    const handleMoreClick = (event) => {
        setMoreMenuAnchor(event.currentTarget);
    };

    const handleMoreClose = () => {
        setMoreMenuAnchor(null);
    };

    const handleAskAI = async () => {
        try {
            // 1. Find the AI User
            const userRes = await axios.get(`/api/users?username=Classic_AI`);
            const aiUser = userRes.data;

            if (!aiUser) {
                console.error("AI User not found");
                return;
            }

            // 2. Create or Get Conversation with AI
            const convRes = await axios.post('/api/conversations', {
                senderId: user._id,
                receiverId: aiUser._id
            }, {
                headers: { 'x-auth-token': token }
            });

            const conversation = convRes.data;

            // 3. Navigate to chat with this conversation
            navigate('/chat', { state: { currentChat: conversation } });
        } catch (err) {
            console.error("Error starting AI chat:", err);
        }
    };

    const handleNavItemClick = (item) => {
        if (item.action === 'ask_ai') {
            handleAskAI();
        }
    };

    const handleMoreItemClick = (item) => {
        if (item.action === 'logout') {
            logout();
        } else if (item.action === 'settings') {
            setSettingsModalOpen(true);
        } else if (item.action === 'theme') {
            dispatch({ type: "TOGGLE" });
        } else if (item.action === 'report') {
            setReportModalOpen(true);
        }
        handleMoreClose();
    };

    const isActive = (path) => location.pathname === path;

    return (
        <Box
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            sx={{
                width: isExpanded ? 244 : 72,
                minHeight: '100vh',
                bgcolor: 'background.default',
                borderRight: 1,
                borderColor: 'divider',
                position: 'fixed',
                left: 0,
                top: 0,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1200,
                padding: '8px 12px',
                overflow: 'hidden',
                '&:hover': {
                    boxShadow: theme.shadows[4]
                }
            }}
        >
            {/* Logo */}
            <Box
                sx={{
                    py: 3,
                    px: 0.5,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isExpanded ? 'flex-start' : 'center',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                }}
            >
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                    {isExpanded ? (
                        <Box sx={{
                            opacity: 1,
                            transform: 'translateX(0)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}>
                            <Logo size="medium" />
                        </Box>
                    ) : (
                        <Box sx={{
                            background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888, #833ab4, #5b51d8, #405de6)',
                            backgroundSize: '200% 200%',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            animation: 'rainbow 3s ease infinite',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}>
                            ∞
                        </Box>
                    )}
                </Link>
            </Box>

            {/* Navigation Items */}
            <List sx={{ flex: 1, px: 0 }}>
                {navItems.map((item, index) => (
                    <ListItem
                        key={item.text}
                        disablePadding
                        sx={{
                            mb: 0.5,
                            opacity: 0,
                            animation: `slideIn 0.3s ease forwards`,
                            animationDelay: `${index * 0.05}s`
                        }}
                    >
                        <ListItemButton
                            component={item.path ? Link : 'div'}
                            to={item.path}
                            onClick={() => item.action ? handleNavItemClick(item) : null}
                            sx={{
                                borderRadius: '8px',
                                py: 1.5,
                                px: 1.5,
                                minHeight: 48,
                                justifyContent: isExpanded ? 'flex-start' : 'center',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                    transform: 'scale(1.02)'
                                },
                                ...(isActive(item.path) && {
                                    bgcolor: 'action.selected'
                                })
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: isExpanded ? 46 : 'auto',
                                    color: 'text.primary',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                {item.avatar ? (
                                    <Avatar
                                        src={user?.profilePicture || '/assets/person/noAvatar.png'}
                                        sx={{
                                            width: 26,
                                            height: 26,
                                            border: isActive(item.path) ? `2px solid ${theme.palette.text.primary}` : 'none',
                                            transition: 'all 0.2s ease'
                                        }}
                                    />
                                ) : item.badge > 0 ? (
                                    <Badge
                                        badgeContent={item.badge}
                                        color="error"
                                        max={99}
                                        sx={{
                                            '& .MuiBadge-badge': {
                                                backgroundColor: '#22c55e',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                fontSize: '0.7rem',
                                                minWidth: 18,
                                                height: 18
                                            }
                                        }}
                                    >
                                        {React.cloneElement(item.icon, {
                                            sx: {
                                                fontSize: 26,
                                                transition: 'all 0.2s ease'
                                            }
                                        })}
                                    </Badge>
                                ) : (
                                    React.cloneElement(item.icon, {
                                        sx: {
                                            fontSize: 26,
                                            transition: 'all 0.2s ease'
                                        }
                                    })
                                )}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                sx={{
                                    opacity: isExpanded ? 1 : 0,
                                    transform: isExpanded ? 'translateX(0)' : 'translateX(-10px)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '& .MuiTypography-root': {
                                        color: 'text.primary',
                                        fontWeight: isActive(item.path) ? 700 : 400,
                                        fontSize: '15px'
                                    }
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            {/* More Menu */}
            <Box sx={{ mt: 'auto', mb: 2 }}>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={handleMoreClick}
                        sx={{
                            borderRadius: '8px',
                            py: 1.5,
                            px: 1.5,
                            minHeight: 48,
                            justifyContent: isExpanded ? 'flex-start' : 'center',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                bgcolor: 'action.hover',
                                transform: 'scale(1.02)'
                            }
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: isExpanded ? 46 : 'auto',
                                color: 'text.primary',
                                justifyContent: 'center',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            <MenuIcon sx={{ fontSize: 26 }} />
                        </ListItemIcon>
                        <ListItemText
                            primary="More"
                            sx={{
                                opacity: isExpanded ? 1 : 0,
                                transform: isExpanded ? 'translateX(0)' : 'translateX(-10px)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '& .MuiTypography-root': {
                                    color: 'text.primary',
                                    fontSize: '15px'
                                }
                            }}
                        />
                    </ListItemButton>
                </ListItem>

                <Menu
                    anchorEl={moreMenuAnchor}
                    open={Boolean(moreMenuAnchor)}
                    onClose={handleMoreClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    PaperProps={{
                        sx: {
                            bgcolor: 'background.paper',
                            color: 'text.primary',
                            borderRadius: '16px',
                            minWidth: 200,
                            boxShadow: theme.shadows[10],
                        }
                    }}
                >
                    {moreItems.map((item) => (
                        <MenuItem
                            key={item.text}
                            onClick={() => item.path ? handleMoreClose() : handleMoreItemClick(item)}
                            component={item.path ? Link : 'li'}
                            to={item.path}
                            sx={{
                                py: 1.5,
                                px: 2,
                                color: 'text.primary',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                    transform: 'translateX(4px)'
                                }
                            }}
                        >
                            <ListItemIcon sx={{ color: 'text.primary', minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            {item.text}
                        </MenuItem>
                    ))}
                </Menu>
            </Box>

            {/* Global Styles for animations */}
            <style>
                {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes rainbow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
            </style>

            <SettingsModal open={settingsModalOpen} onClose={() => setSettingsModalOpen(false)} />
            <ReportProblemModal open={reportModalOpen} onClose={() => setReportModalOpen(false)} />
        </Box>
    );
};

export default Sidebar;
