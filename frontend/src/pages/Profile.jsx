import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
    Box,
    Typography,
    Avatar,
    Button,
    Grid,
    Divider,
    CircularProgress,
    IconButton,
    Modal,
    TextField,
    Stack,
    Fade,
    Backdrop,
    Alert,
    Menu,
    MenuItem
} from '@mui/material';
import {
    Settings,
    Close,
    CameraAlt,
    GridOn,
    MoreVert,
    Movie,
    QuestionMark,
    ArrowBack,
    Reply
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import SettingsModal from '../components/SettingsModal';
import ReportProblemModal from '../components/ReportProblemModal';

const EditProfileModal = ({ open, onClose, user, onUpdate }) => {
    const [formData, setFormData] = useState({
        username: user?.username || '',
        name: user?.name || '',
        desc: user?.desc || '',
        profilePicture: user?.profilePicture || ''
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const { token } = useAuth();

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                name: user.name || '',
                desc: user.desc || '',
                profilePicture: user.profilePicture || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Clear error on change
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const data = new FormData();
        data.append('files', file);

        setUploading(true);
        try {
            const res = await axios.post('/api/upload', data, {
                headers: { 'x-auth-token': token }
            });
            // Assuming the API returns an array of URLs
            setFormData(prev => ({ ...prev, profilePicture: res.data[0] }));
        } catch (err) {
            console.error("Error uploading file:", err);
            setError('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            await onUpdate(formData);
            onClose();
        } catch (error) {
            console.error(error);
            setError('Failed to update profile. Username might be taken.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
                sx: { backgroundColor: 'rgba(0, 0, 0, 0.8)' }
            }}
        >
            <Fade in={open}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '90%', sm: 400 },
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: '16px',
                    boxShadow: 24,
                    p: 4,
                    color: 'text.primary',
                    outline: 'none'
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold">Edit Profile</Typography>
                        <IconButton onClick={onClose} sx={{ color: 'text.primary' }}><Close /></IconButton>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Stack spacing={3}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ position: 'relative' }}>
                                <Avatar src={formData.profilePicture || "/assets/person/noAvatar.png"} sx={{ width: 100, height: 100, border: '2px solid #363636' }} />
                                {uploading && (
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0, left: 0, width: '100%', height: '100%',
                                        borderRadius: '50%',
                                        bgcolor: 'rgba(0,0,0,0.5)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <CircularProgress size={24} sx={{ color: 'white' }} />
                                    </Box>
                                )}
                            </Box>
                            <Button component="label" sx={{ color: '#0095f6', textTransform: 'none', fontWeight: 600, '&:hover': { color: 'white' } }}>
                                Change profile photo
                                <input hidden accept="image/*" type="file" onChange={handleFileChange} />
                            </Button>
                        </Box>

                        <TextField
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'text.primary',
                                    borderRadius: '8px',
                                    '& fieldset': { borderColor: 'divider' },
                                    '&:hover fieldset': { borderColor: 'text.secondary' },
                                    '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                                },
                                '& .MuiInputLabel-root': { color: 'text.secondary' },
                                '& .MuiInputLabel-root.Mui-focused': { color: 'primary.main' }
                            }}
                        />

                        <TextField
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'text.primary',
                                    borderRadius: '8px',
                                    '& fieldset': { borderColor: 'divider' },
                                    '&:hover fieldset': { borderColor: 'text.secondary' },
                                    '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                                },
                                '& .MuiInputLabel-root': { color: 'text.secondary' },
                                '& .MuiInputLabel-root.Mui-focused': { color: 'primary.main' }
                            }}
                        />

                        <TextField
                            label="Bio"
                            name="desc"
                            value={formData.desc}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={3}
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'text.primary',
                                    borderRadius: '8px',
                                    '& fieldset': { borderColor: 'divider' },
                                    '&:hover fieldset': { borderColor: 'text.secondary' },
                                    '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                                },
                                '& .MuiInputLabel-root': { color: 'text.secondary' },
                                '& .MuiInputLabel-root.Mui-focused': { color: 'primary.main' }
                            }}
                        />

                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={loading || uploading}
                            fullWidth
                            sx={{
                                bgcolor: '#0095f6',
                                textTransform: 'none',
                                fontWeight: 600,
                                py: 1.5,
                                borderRadius: '8px',
                                '&:hover': { bgcolor: '#1877f2' },
                                '&.Mui-disabled': { bgcolor: 'rgba(0, 149, 246, 0.5)', color: 'rgba(255,255,255,0.5)' }
                            }}
                        >
                            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Submit'}
                        </Button>

                        <Button
                            variant="outlined"
                            onClick={() => {
                                alert('Delete button clicked!');
                                axios.delete(`/api/users/${user._id}`, {
                                    headers: { 'x-auth-token': token }
                                })
                                    .then(() => {
                                        localStorage.removeItem('user');
                                        localStorage.removeItem('token');
                                        window.location.href = '/';
                                    })
                                    .catch((error) => {
                                        console.error('Error deleting account:', error);
                                        setError('Failed to delete account. Please try again.');
                                    });
                            }}
                            fullWidth
                            sx={{
                                color: '#ed4956',
                                borderColor: '#ed4956',
                                textTransform: 'none',
                                fontWeight: 600,
                                py: 1.5,
                                borderRadius: '8px',
                                '&:hover': {
                                    borderColor: '#c13584',
                                    bgcolor: 'rgba(237, 73, 86, 0.1)'
                                }
                            }}
                        >
                            Delete Account
                        </Button>
                    </Stack>
                </Box>
            </Fade>
        </Modal>
    );
};

const FollowListModal = ({ open, onClose, type, users, isOwnProfile, currentUserId, onRemove }) => {
    // ... existing FollowListModal code ...
    const navigate = useNavigate();
    const { token } = useAuth();

    const handleUnfollow = async (e, userId) => {
        e.stopPropagation(); // Prevent navigation


        try {
            await axios.put(`/api/users/${userId}/unfollow`, {}, {
                headers: { 'x-auth-token': token }
            });
            if (onRemove) onRemove(userId);
        } catch (err) {
            console.error("Error unfollowing user:", err);
            alert("Failed to unfollow user");
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
                sx: { backgroundColor: 'rgba(0, 0, 0, 0.8)' }
            }}
        >
            <Fade in={open}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '90%', sm: 400 },
                    maxHeight: '80vh',
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: '16px',
                    boxShadow: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    color: 'text.primary',
                    outline: 'none'
                }}>
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>{type}</Typography>
                        <IconButton onClick={onClose} sx={{ color: 'text.primary' }}><Close /></IconButton>
                    </Box>

                    <Box sx={{ overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {users.length > 0 ? (
                            users.map((user) => (
                                <Box
                                    key={user._id}
                                    onClick={() => {
                                        onClose();
                                        navigate(`/profile/${user.username}`);
                                    }}
                                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar src={user.profilePicture || "/assets/person/noAvatar.png"} />
                                        <Box>
                                            <Typography fontWeight="600">{user.username}</Typography>
                                            <Typography variant="body2" sx={{ color: '#a8a8a8' }}>{user.name}</Typography>
                                        </Box>
                                    </Box>

                                    {isOwnProfile && type === 'following' && (
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                                color: 'text.primary',
                                                borderColor: 'divider',
                                                textTransform: 'none',
                                                '&:hover': { borderColor: 'text.primary', bgcolor: 'action.hover' }
                                            }}
                                            onClick={(e) => handleUnfollow(e, user._id)}
                                        >
                                            Unfollow
                                        </Button>
                                    )}
                                </Box>
                            ))
                        ) : (
                            <Typography variant="body2" sx={{ color: '#a8a8a8', textAlign: 'center' }}>No users found.</Typography>
                        )}
                    </Box>
                </Box>
            </Fade>
        </Modal>
    );
};

export default function Profile() {
    const [profileUser, setProfileUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);

    // Follow List Modal State
    const [followModalOpen, setFollowModalOpen] = useState(false);
    const [followModalType, setFollowModalType] = useState('followers'); // 'followers' or 'following'
    const [followList, setFollowList] = useState([]);

    // Post menu state
    const [postMenuAnchor, setPostMenuAnchor] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Report User State
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [userMenuAnchor, setUserMenuAnchor] = useState(null);

    const handleUserMenuOpen = (event) => {
        setUserMenuAnchor(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setUserMenuAnchor(null);
    };

    const handleReportUser = () => {
        setReportModalOpen(true);
        handleUserMenuClose();
    };

    // Tab state
    const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'reels'

    const isVideo = (url) => {
        if (!url) return false;
        // Check extension
        const videoExtensions = ['.mp4', '.mov', '.webm', '.ogg'];
        const lowerUrl = url.toLowerCase();
        for (let ext of videoExtensions) {
            if (lowerUrl.includes(ext)) return true;
        }
        // Also check if it looks like a cloud storage video url if needed
        return false;
    };

    const { username } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, token, updateUser } = useAuth();

    const isOwnProfile = currentUser?.username === profileUser?.username;

    useEffect(() => {
        const fetchUser = async () => {
            if (!username) return;
            try {
                const res = await axios.get(`/api/users?username=${username}`, {
                    headers: { 'x-auth-token': token }
                });
                setProfileUser(res.data);
            } catch (err) {
                console.error('Error fetching user:', err);
            }
        };
        fetchUser();
    }, [username, token]);

    const [followed, setFollowed] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    useEffect(() => {
        if (currentUser && profileUser) {
            setFollowed(profileUser.followers.includes(currentUser._id));
        }
    }, [currentUser, profileUser]);

    const handleFollow = async () => {
        try {
            if (followed) {
                await axios.put(`/api/users/${profileUser._id}/unfollow`, {}, {
                    headers: { 'x-auth-token': token }
                });
            } else {
                await axios.put(`/api/users/${profileUser._id}/follow`, {}, {
                    headers: { 'x-auth-token': token }
                });
            }
            setFollowed(!followed);
            // Optional: Refresh user data to update counts immediately
            setProfileUser(prev => ({
                ...prev,
                followers: followed
                    ? prev.followers.filter(id => id !== currentUser._id)
                    : [...prev.followers, currentUser._id]
            }));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const fetchPosts = async () => {
            if (!username) return;
            try {
                const res = await axios.get(`/api/posts/profile/${username}`, {
                    headers: { 'x-auth-token': token }
                });
                setPosts(
                    res.data.sort((p1, p2) => {
                        return new Date(p2.createdAt) - new Date(p1.createdAt);
                    })
                );
            } catch (err) {
                console.error('Error fetching posts:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [username, token]);

    const handleUpdateProfile = async (updatedData) => {
        try {
            const payload = { ...updatedData };
            // Remove username if it hasn't changed to avoid unique constraint error
            if (payload.username === profileUser.username) {
                delete payload.username;
            }

            const res = await axios.put(`/api/users/${profileUser._id}`, payload, {
                headers: { 'x-auth-token': token }
            });
            setProfileUser(res.data);

            // If updating own profile, update context as well
            if (currentUser._id === res.data._id) {
                updateUser(res.data); // Update context and local storage properly
                // If username changed, navigate to new url
                if (currentUser.username !== res.data.username) {
                    navigate(`/profile/${res.data.username}`);
                }
            }
        } catch (err) {
            console.error("Error updating profile:", err);
            console.error("Error response:", err.response?.data);
            // Re-throw with more detail if possible, or handle here
            throw err;
        }
    };

    const handleOpenFollowModal = async (type) => {
        if (!profileUser) return;
        setFollowModalType(type);
        setFollowList([]); // Clear previous list
        setFollowModalOpen(true);

        try {
            const res = await axios.get(`/api/users/friends/${profileUser._id}`, {
                headers: { 'x-auth-token': token }
            });
            if (type === 'followers') {
                setFollowList(res.data.followers);
            } else {
                setFollowList(res.data.following);
            }
        } catch (err) {
            console.error("Error fetching friends:", err);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', bgcolor: 'background.default' }}>
                <CircularProgress color="inherit" />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: '935px', margin: '0 auto', p: { xs: 2, md: 4 }, bgcolor: 'background.default', minHeight: '100vh', color: 'text.primary' }}>
            {/* Back Button with Premium Style */}
            <Box sx={{ mb: 4 }}>
                <IconButton
                    onClick={() => navigate('/')}
                    sx={{
                        color: 'text.primary',
                        bgcolor: 'background.paper',
                        boxShadow: 3,
                        p: 1.5,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            bgcolor: 'action.hover',
                            transform: 'translateX(-4px)',
                            boxShadow: 6
                        }
                    }}
                >
                    <Reply sx={{ fontSize: 32 }} /> {/* Curved arrow effect */}
                </IconButton>
            </Box>

            {/* Profile Header */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'center', md: 'flex-start' }, mb: 6, gap: { xs: 3, md: 10 } }}>

                {/* Left Column: Avatar & Edit Button */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                    <Avatar
                        src={profileUser?.profilePicture || "/assets/person/noAvatar.png"}
                        sx={{ width: { xs: 77, md: 150 }, height: { xs: 77, md: 150 }, border: 1, borderColor: 'divider' }}
                    />

                    {isOwnProfile ? (
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => setEditModalOpen(true)}
                            sx={{
                                textTransform: 'none',
                                bgcolor: '#0095f6', // Blue background
                                color: 'white',
                                fontWeight: 600,
                                px: 3,
                                width: '100%',
                                borderRadius: '8px',
                                '&:hover': { bgcolor: '#1877f2' }
                            }}
                        >
                            Edit profile
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            size="small"
                            onClick={handleFollow}
                            sx={{
                                textTransform: 'none',
                                bgcolor: followed ? '#363636' : '#0095f6',
                                color: 'white',
                                fontWeight: 600,
                                px: 3,
                                width: '100%',
                                borderRadius: '8px',
                                '&:hover': { bgcolor: followed ? '#262626' : '#1877f2' }
                            }}
                        >
                            {followed ? 'Unfollow' : 'Follow'}
                        </Button>
                    )}
                </Box>

                {/* Right Column: Info */}
                <Box sx={{ flexGrow: 1, width: '100%', pt: 1, display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-start' } }}>
                    {/* Row 1: Username & Settings */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexDirection: { xs: 'column', md: 'row' } }}>
                        <Typography variant="h5" sx={{ fontWeight: 400, fontSize: '20px' }}>{profileUser?.username}</Typography>

                        {isOwnProfile ? (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => navigate('/activity?tab=archived')} // Link to Activity page
                                    sx={{
                                        textTransform: 'none',
                                        bgcolor: 'action.selected',
                                        color: 'text.primary',
                                        fontWeight: 600,
                                        px: 2,
                                        py: 0.5,
                                        borderRadius: '8px',
                                        '&:hover': { bgcolor: 'action.hover' }
                                    }}
                                >
                                    View archive
                                </Button>
                                <IconButton sx={{ color: 'text.primary' }} onClick={() => setSettingsOpen(true)}>
                                    <Settings />
                                </IconButton>
                            </Box>
                        ) : (
                            <Box>
                                <IconButton onClick={handleUserMenuOpen} sx={{ color: 'text.primary' }}>
                                    <MoreVert />
                                </IconButton>
                                <Menu
                                    anchorEl={userMenuAnchor}
                                    open={Boolean(userMenuAnchor)}
                                    onClose={handleUserMenuClose}
                                >
                                    <MenuItem onClick={handleReportUser} sx={{ color: 'error.main' }}>
                                        Report User
                                    </MenuItem>
                                </Menu>
                            </Box>
                        )}
                    </Box>

                    {/* Row 2: Full Name */}
                    <Typography fontWeight="600" sx={{ fontSize: '16px', mb: 2, color: 'text.primary' }}>{profileUser?.name}</Typography>

                    {/* Row 3: Stats */}
                    <Box sx={{ display: 'flex', gap: 4, mb: 2.5 }}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Typography fontWeight="bold">
                                {posts.filter(p => !isVideo(p.media?.[0] || p.image)).length}
                            </Typography>
                            <Typography>posts</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5, cursor: 'pointer' }} onClick={() => handleOpenFollowModal('followers')}>
                            <Typography fontWeight="bold">{profileUser?.followers?.length || 0}</Typography>
                            <Typography>followers</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5, cursor: 'pointer' }} onClick={() => handleOpenFollowModal('following')}>
                            <Typography fontWeight="bold">{profileUser?.following?.length || 0}</Typography>
                            <Typography>following</Typography>
                        </Box>
                    </Box>

                    {/* Row 4: Bio */}
                    <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '14px', mb: 3, color: 'text.secondary' }}>
                            {profileUser?.desc}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Divider sx={{ borderColor: 'divider', mb: 2 }} />

            {/* Posts / Reels Tabs */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, borderTop: 1, borderColor: 'divider' }}>
                <Box
                    onClick={() => setActiveTab('posts')}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        gap: 1,
                        borderTop: activeTab === 'posts' ? 1 : 0,
                        borderColor: activeTab === 'posts' ? 'text.primary' : 'transparent',
                        pt: 1,
                        mr: 4,
                        cursor: 'pointer',
                        color: activeTab === 'posts' ? 'text.primary' : 'text.secondary'
                    }}
                >
                    <GridOn sx={{ fontSize: 12 }} />
                    <Typography sx={{ fontSize: '12px', fontWeight: 600, letterSpacing: '1px' }}>POSTS</Typography>
                </Box>
                <Box
                    onClick={() => setActiveTab('reels')}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        gap: 1,
                        borderTop: activeTab === 'reels' ? 1 : 0,
                        borderColor: activeTab === 'reels' ? 'text.primary' : 'transparent',
                        pt: 1,
                        cursor: 'pointer',
                        color: activeTab === 'reels' ? 'text.primary' : 'text.secondary'
                    }}
                >
                    <Movie sx={{ fontSize: 12 }} />
                    <Typography sx={{ fontSize: '12px', fontWeight: 600, letterSpacing: '1px' }}>REELS</Typography>
                </Box>
            </Box>

            {/* Post Grid */}
            <Grid container spacing={0.5}>
                {posts.filter(p => {
                    if (activeTab === 'reels') {
                        return isVideo(p.media?.[0] || p.image);
                    } else {
                        return !isVideo(p.media?.[0] || p.image);
                    }
                }).length > 0 ? (
                    posts.filter(p => {
                        if (activeTab === 'reels') {
                            return isVideo(p.media?.[0] || p.image);
                        } else {
                            return !isVideo(p.media?.[0] || p.image);
                        }
                    }).map((post) => (
                        <Grid item xs={4} key={post._id}>
                            <Box
                                sx={{
                                    position: 'relative',
                                    paddingTop: activeTab === 'reels' ? '177.77%' : '100%',
                                    bgcolor: '#121212',
                                    cursor: 'pointer',
                                    '&:hover .overlay': { display: 'flex' }
                                }}
                                onClick={() => navigate(`/post/${post._id}`)}
                            >
                                <ReelGridItem post={post} isVideoFn={isVideo} isReelView={activeTab === 'reels'} />

                                {/* Hover Overlay */}
                                <Box
                                    className="overlay"
                                    sx={{
                                        display: 'none',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        bgcolor: 'rgba(0,0,0,0.3)',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        gap: 2
                                    }}
                                >
                                    <Typography fontWeight="bold">❤️ {post.likes?.length || 0}</Typography>
                                    <Typography fontWeight="bold">💬 {post.comments?.length || 0}</Typography>
                                </Box>

                                {/* Delete Button (only for own posts) */}
                                {isOwnProfile && (
                                    <IconButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPostMenuAnchor(e.currentTarget);
                                            setSelectedPost(post);
                                        }}
                                        sx={{
                                            position: 'absolute',
                                            top: 5,
                                            right: 5,
                                            bgcolor: 'rgba(0,0,0,0.7)',
                                            color: 'white',
                                            width: 28,
                                            height: 28,
                                            '&:hover': {
                                                bgcolor: 'rgba(0,0,0,0.9)',
                                                '& .MuiSvgIcon-root': { transform: 'scale(1.1)' }
                                            },
                                            opacity: 0,
                                            transition: 'opacity 0.2s',
                                            '&:hover, .MuiBox-root:hover &': { opacity: 1 }
                                        }}
                                        size="small"
                                    >
                                        <MoreVert fontSize="small" />
                                    </IconButton>
                                )}
                            </Box>
                        </Grid>
                    ))
                ) : (
                    <Box sx={{ width: '100%', py: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                            width: 62,
                            height: 62,
                            borderRadius: '50%',
                            border: '2px solid white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {activeTab === 'reels' ? <Movie sx={{ fontSize: 34 }} /> : <CameraAlt sx={{ fontSize: 34 }} />}
                        </Box>
                        <Typography variant="h4" fontWeight="800">{activeTab === 'reels' ? 'Share Reels' : 'Share Photos'}</Typography>
                        <Typography variant="body2" sx={{ color: '#a8a8a8' }}>
                            {activeTab === 'reels' ? 'When you share videos, they will appear on your profile.' : 'When you share photos, they will appear on your profile.'}
                        </Typography>
                        <Button sx={{ color: '#0095f6', fontWeight: 600, textTransform: 'none' }}>
                            {activeTab === 'reels' ? 'Share your first reel' : 'Share your first photo'}
                        </Button>
                    </Box>
                )}
            </Grid>

            {/* Post Menu */}
            <Menu
                anchorEl={postMenuAnchor}
                open={Boolean(postMenuAnchor)}
                onClose={() => {
                    setPostMenuAnchor(null);
                    setSelectedPost(null);
                }}
                PaperProps={{
                    sx: {
                        bgcolor: '#262626',
                        color: 'white',
                        border: '1px solid #363636',
                        borderRadius: 2,
                        minWidth: 150
                    }
                }}
            >
                <MenuItem
                    onClick={async () => {
                        const isReel = selectedPost && isVideo(selectedPost.media?.[0] || selectedPost.image);
                        const typeLabel = isReel ? "Reel" : "Post";
                        console.log(`Save ${typeLabel} clicked`);
                        try {
                            const res = await axios.put(`/api/users/${currentUser._id}/save/${selectedPost._id}`, {}, {
                                headers: { 'x-auth-token': token }
                            });

                            // Display specific message based on backend response
                            if (res.data === 'Post saved') {
                                toast.success(`${typeLabel} saved successfully`);
                            } else {
                                toast.success(`${typeLabel} unsaved successfully`);
                            }
                            setPostMenuAnchor(null);
                        } catch (err) {
                            console.error(err);
                            toast.error(`Failed to save ${typeLabel.toLowerCase()}`);
                        }
                    }}
                    sx={{
                        fontWeight: 600,
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                    }}
                >
                    {selectedPost && isVideo(selectedPost.media?.[0] || selectedPost.image) ? "Save Reel" : "Save Post"}
                </MenuItem>

                {/* Archive Option (Only for Own Profile) */}
                {isOwnProfile && (
                    <MenuItem
                        onClick={async () => {
                            setPostMenuAnchor(null);
                            if (selectedPost) {
                                try {
                                    await axios.put(`/api/posts/${selectedPost._id}/archive`, {}, {
                                        headers: { 'x-auth-token': token }
                                    });
                                    // Remove from UI
                                    setPosts(prev => prev.filter(p => p._id !== selectedPost._id));
                                    toast.success("Post archived");
                                } catch (err) {
                                    console.error("Error archiving post:", err);
                                    toast.error("Failed to archive post");
                                }
                            }
                        }}
                        sx={{
                            fontWeight: 600,
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                        }}
                    >
                        Archive
                    </MenuItem>
                )}
                <MenuItem
                    onClick={() => {
                        setPostMenuAnchor(null);
                        setDeleteDialogOpen(true);
                    }}
                    sx={{
                        color: '#ed4956',
                        fontWeight: 600,
                        '&:hover': { bgcolor: 'rgba(237, 73, 86, 0.1)' }
                    }}
                >
                    {selectedPost && isVideo(selectedPost.media?.[0] || selectedPost.image) ? "Delete Reel" : "Delete Post"}
                </MenuItem>
            </Menu>

            {/* Delete Confirmation Dialog */}
            <Modal
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{ timeout: 500 }}
            >
                <Fade in={deleteDialogOpen}>
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: '#262626',
                        border: '1px solid #363636',
                        borderRadius: 3,
                        boxShadow: 24,
                        p: 0,
                        outline: 'none'
                    }}>
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="h6" fontWeight="600" mb={2} sx={{ color: 'white' }}>
                                Delete {selectedPost && isVideo(selectedPost.media?.[0] || selectedPost.image) ? "Reel" : "Post"}?
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#a8a8a8', mb: 3 }}>
                                Are you sure you want to delete this {selectedPost && isVideo(selectedPost.media?.[0] || selectedPost.image) ? "reel" : "post"}? This action cannot be undone.
                            </Typography>
                            <Stack spacing={1}>
                                <Button
                                    fullWidth
                                    onClick={async () => {
                                        console.log('User confirmed deletion');
                                        try {
                                            console.log('Sending DELETE request to:', `/api/posts/${selectedPost._id}`);
                                            const response = await axios.delete(`/api/posts/${selectedPost._id}`, {
                                                headers: { 'x-auth-token': token }
                                            });
                                            console.log('Delete response:', response);
                                            console.log('Post deleted successfully');

                                            // Remove post from state
                                            setPosts(posts.filter(p => p._id !== selectedPost._id));
                                            setDeleteDialogOpen(false);
                                            setSelectedPost(null);
                                        } catch (err) {
                                            console.error('Error deleting post:', err);
                                            console.error('Error response:', err.response);
                                            toast.error(`Failed to delete ${selectedPost && isVideo(selectedPost.media?.[0] || selectedPost.image) ? "reel" : "post"}: ${err.response?.data?.message || err.message}`);
                                        }
                                    }}
                                    sx={{
                                        color: '#ed4956',
                                        fontWeight: 700,
                                        textTransform: 'none',
                                        '&:hover': { bgcolor: 'rgba(237, 73, 86, 0.1)' }
                                    }}
                                >
                                    Delete
                                </Button>
                                <Button
                                    fullWidth
                                    onClick={() => {
                                        console.log('User cancelled deletion');
                                        setDeleteDialogOpen(false);
                                    }}
                                    sx={{
                                        color: 'white',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                                    }}
                                >
                                    Cancel
                                </Button>
                            </Stack>
                        </Box>
                    </Box>
                </Fade>
            </Modal>

            {/* Edit Profile Modal */}
            <EditProfileModal
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                user={profileUser}
                onUpdate={handleUpdateProfile}
            />
            {/* Follow List Modal */}
            <FollowListModal
                open={followModalOpen}
                onClose={() => setFollowModalOpen(false)}
                type={followModalType}
                users={followList}
                isOwnProfile={isOwnProfile && currentUser._id === profileUser._id}
                currentUserId={currentUser?._id}
                onRemove={(id) => {
                    setFollowList(prev => prev.filter(u => u._id !== id));
                    // Update main profile stats
                    if (followModalType === 'following') {
                        setProfileUser(prev => ({
                            ...prev,
                            following: prev.following.filter(fid => fid !== id)
                        }));
                    }
                }}
            />
            {/* Report Problem Modal */}
            <ReportProblemModal
                open={reportModalOpen}
                onClose={() => setReportModalOpen(false)}
                target={`User: ${profileUser?.username}`}
            />
            {/* Settings Modal */}
            <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </Box >
    );
}

const ReelGridItem = ({ post, isVideoFn, isReelView }) => {
    const [imgError, setImgError] = useState(false);

    // Logic for REELS tab
    if (isReelView) {
        // 1. Must have post.image
        // 2. post.image must NOT be a video URL (using isVideoFn)
        // 3. Image must not have failed to load (imgError)
        const hasValidThumbnail = post.image && !isVideoFn(post.image) && !imgError;

        if (hasValidThumbnail) {
            return (
                <img
                    src={post.image}
                    alt=""
                    onError={() => setImgError(true)}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
            );
        }

        // Fallback: Show Question Mark Placeholder
        return (
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                bgcolor: 'black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <QuestionMark sx={{ color: 'white', fontSize: 40 }} />
            </Box>
        );
    }

    // Logic for POSTS tab (Standard Image Display)
    // We want to avoid using post.image if it's actually a video (which would break the img tag).
    // so we check if post.image is a video. If so, we ignore it and use post.media[0] or default.
    const validPostImage = post.image && !isVideoFn(post.image) ? post.image : null;
    const displaySrc = validPostImage || post.media?.[0] || '/assets/person/noAvatar.png';

    return (
        <img
            src={displaySrc}
            alt=""
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
    );
};
