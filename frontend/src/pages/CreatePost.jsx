import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Avatar, IconButton, CircularProgress, MenuItem, Select, FormControl, InputLabel, Switch, FormControlLabel } from '@mui/material';
import { PhotoCamera, Close, Image as ImageIcon, LiveTv } from '@mui/icons-material';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreatePost = () => {
    const [creationMode, setCreationMode] = useState(null); // null | 'post' | 'reel' | 'stream'
    const [text, setText] = useState('');
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState('OTHER');
    const { user, token } = useAuth();
    const navigate = useNavigate();

    // Stream State
    const [streamTitle, setStreamTitle] = useState('');
    const [streamType, setStreamType] = useState('non-live'); // 'live' | 'non-live'
    const [liveLink, setLiveLink] = useState('');

    const categories = [
        { value: 'GYM', label: '💪 Gym & Fitness', emoji: '💪' },
        { value: 'FOOD', label: '🍔 Food & Cooking', emoji: '🍔' },
        { value: 'ACT', label: '🎭 Acting & Performance', emoji: '🎭' },
        { value: 'ART', label: '🎨 Art & Design', emoji: '🎨' },
        { value: 'MOVIES', label: '🎬 Movies & Cinema', emoji: '🎬' },
        { value: 'PRODUCTS', label: '📦 Product Reviews', emoji: '📦' },
        { value: 'TECH', label: '💻 Technology', emoji: '💻' },
        { value: 'GAMING', label: '🎮 Gaming', emoji: '🎮' },
        { value: 'OTHER', label: '📌 Other', emoji: '📌' },
    ];

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);

        // Create previews
        const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);
    };

    const removeFile = (index) => {
        const newFiles = files.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);
        setFiles(newFiles);
        setPreviews(newPreviews);
    };

    // Cover Image State
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const removeCover = () => {
        setCoverFile(null);
        setCoverPreview(null);
    };



    const handleCreateStream = async () => {
        if (!streamTitle) {
            alert('Please add a title');
            return;
        }
        if (streamType === 'non-live' && files.length === 0) {
            alert('Please upload a video for non-live stream');
            return;
        }

        setLoading(true);
        try {
            let mediaUrl = null;

            if (files.length > 0) {
                const formData = new FormData();
                formData.append('files', files[0]);
                const uploadRes = await axios.post('/api/upload', formData, {
                    headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' }
                });
                mediaUrl = uploadRes.data[0];
            }

            await axios.post('/api/streams', {
                title: streamTitle,
                description: text,
                category: category,
                type: streamType,
                mediaUrl: mediaUrl, // Video URL for non-live
                liveLink: liveLink
            }, {
                headers: { 'x-auth-token': token }
            });

            navigate('/streaming');
        } catch (err) {
            console.error('Error creating stream:', err);
            alert('Failed to create stream');
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        if (!text && files.length === 0) {
            alert('Please add some text or upload a media file');
            return;
        }

        setLoading(true);
        try {
            let mediaUrls = [];

            // Upload files if any
            if (files.length > 0) {
                const formData = new FormData();
                files.forEach(file => {
                    formData.append('files', file);
                });

                const uploadRes = await axios.post('/api/upload', formData, {
                    headers: {
                        'x-auth-token': token,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                mediaUrls = uploadRes.data;
            }

            // Upload Cover if exists
            let coverUrl = null;
            if (coverFile) {
                const coverFormData = new FormData();
                coverFormData.append('files', coverFile);
                const coverRes = await axios.post('/api/upload', coverFormData, {
                    headers: {
                        'x-auth-token': token,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                if (coverRes.data && coverRes.data.length > 0) {
                    coverUrl = coverRes.data[0];
                }
            }

            // Create post with category
            await axios.post('/api/posts', {
                text,
                media: mediaUrls,
                image: coverUrl, // Send cover URL
                category: creationMode === 'reel' ? 'OTHER' : category
            }, {
                headers: { 'x-auth-token': token }
            });

            navigate(`/profile/${user.username}`);
        } catch (err) {
            console.error('Error creating post:', err);
            alert('Failed to create post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Selection Screen
    if (!creationMode) {
        return (
            <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh', color: 'text.primary' }}>
                <Sidebar />
                <Box sx={{ flex: 1, marginLeft: '72px', display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                    <Box sx={{ width: '100%', maxWidth: 800, display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>

                        {/* Create Post Card */}
                        <Box
                            onClick={() => setCreationMode('post')}
                            sx={{
                                width: 300,
                                height: 300,
                                bgcolor: 'background.paper',
                                borderRadius: 4,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                '&:hover': { bgcolor: 'action.hover', transform: 'translateY(-5px)' },
                                boxShadow: 3
                            }}
                        >
                            <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'rgba(0,149,246,0.1)', mb: 2 }}>
                                <ImageIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                            </Box>
                            <Typography variant="h5" fontWeight="bold">Create Post</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>Share photos and videos</Typography>
                        </Box>

                        {/* Create Reel Card */}
                        <Box
                            onClick={() => setCreationMode('reel')}
                            sx={{
                                width: 300,
                                height: 300,
                                bgcolor: 'background.paper',
                                borderRadius: 4,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                '&:hover': { bgcolor: 'action.hover', transform: 'translateY(-5px)' },
                                boxShadow: 3
                            }}
                        >
                            <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'rgba(225,48,108,0.1)', mb: 2 }}>
                                <PhotoCamera sx={{ fontSize: 60, color: '#E1306C' }} />
                            </Box>
                            <Typography variant="h5" fontWeight="bold">Create Reel</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>Share short videos</Typography>
                        </Box>

                        {/* Create Stream Card */}
                        <Box
                            onClick={() => setCreationMode('stream')}
                            sx={{
                                width: 300,
                                height: 300,
                                bgcolor: 'background.paper',
                                borderRadius: 4,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                '&:hover': { bgcolor: 'action.hover', transform: 'translateY(-5px)' },
                                boxShadow: 3
                            }}
                        >
                            <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'rgba(211, 47, 47, 0.1)', mb: 2 }}>
                                <LiveTv sx={{ fontSize: 60, color: '#d32f2f' }} />
                            </Box>
                            <Typography variant="h5" fontWeight="bold">Stream</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>Live or Upload (24h)</Typography>
                        </Box>

                    </Box>
                </Box>
            </Box>
        );
    }

    // Creation Form
    return (
        <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh', color: 'text.primary' }}>
            <Sidebar />
            <Box sx={{ flex: 1, marginLeft: '72px', display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                <Box sx={{ width: '100%', maxWidth: 600, p: 3, border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <IconButton onClick={() => setCreationMode(null)} sx={{ color: 'text.primary', mr: 2 }}>
                            <Close />
                        </IconButton>
                        <Typography variant="h6" fontWeight="bold">
                            {creationMode === 'reel' ? 'Create New Reel' : creationMode === 'stream' ? 'Create Stream' : 'Create New Post'}
                        </Typography>
                    </Box>


                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar src={user?.profilePicture || '/assets/person/noAvatar.png'} sx={{ mr: 2, width: 40, height: 40 }} />
                        <Typography fontWeight="600">{user?.username}</Typography>
                    </Box>

                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder={creationMode === 'reel' ? "Write a caption..." : "Write a caption..."}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        sx={{
                            mb: 3,
                            '& .MuiOutlinedInput-root': {
                                color: 'text.primary',
                                bgcolor: 'action.input',
                                borderRadius: 2,
                                '& fieldset': { borderColor: 'divider' },
                                '&:hover fieldset': { borderColor: 'text.secondary' },
                                '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                            },
                            '& .MuiInputBase-input': { color: 'text.primary' }
                        }}
                    />

                    {/* Stream Fields */}
                    {creationMode === 'stream' && (
                        <>
                            <TextField
                                fullWidth
                                placeholder="Stream Title"
                                value={streamTitle}
                                onChange={(e) => setStreamTitle(e.target.value)}
                                sx={{ mb: 3 }}
                            />

                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel>Stream Type</InputLabel>
                                <Select
                                    value={streamType}
                                    label="Stream Type"
                                    onChange={(e) => setStreamType(e.target.value)}
                                >
                                    <MenuItem value="live">Live (Link)</MenuItem>
                                    <MenuItem value="non-live">Non-Live (Upload Video)</MenuItem>
                                </Select>
                            </FormControl>

                            {streamType === 'live' && (
                                <TextField
                                    fullWidth
                                    placeholder="Live Link (e.g. YouTube, Twitch)"
                                    value={liveLink}
                                    onChange={(e) => setLiveLink(e.target.value)}
                                    sx={{ mb: 3 }}
                                />
                            )}
                        </>
                    )}

                    {/* Category Selector - Only for Post Mode or Stream */}
                    {(creationMode === 'post' || creationMode === 'stream') && (
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel sx={{ color: 'text.secondary', '&.Mui-focused': { color: 'primary.main' } }}>Category</InputLabel>
                            <Select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                label="Category"
                                sx={{
                                    color: 'text.primary',
                                    bgcolor: 'action.input',
                                    borderRadius: 2,
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'text.secondary' },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                                    '& .MuiSvgIcon-root': { color: 'text.primary' }
                                }}
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            bgcolor: 'background.paper',
                                            color: 'text.primary',
                                            '& .MuiMenuItem-root': {
                                                '&:hover': { bgcolor: 'action.hover' },
                                                '&.Mui-selected': { bgcolor: 'action.selected', '&:hover': { bgcolor: 'action.selected' } }
                                            }
                                        }
                                    }
                                }}
                            >
                                {categories.map((cat) => (
                                    <MenuItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    {/* Reel Cover Image Selection */}
                    {creationMode === 'reel' && files.length > 0 && files[0].type.startsWith('video/') && (
                        <Box sx={{ mb: 3 }}>
                            <Typography sx={{ mb: 1, fontWeight: 600 }}>Cover Image (Optional)</Typography>
                            {coverPreview ? (
                                <Box sx={{ position: 'relative', width: 100, height: 150, borderRadius: 1, overflow: 'hidden' }}>
                                    <img src={coverPreview} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <IconButton
                                        onClick={removeCover}
                                        sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', width: 20, height: 20 }}
                                        size="small"
                                    >
                                        <Close fontSize="small" />
                                    </IconButton>
                                </Box>
                            ) : (
                                <Button component="label" variant="outlined" sx={{ color: 'text.secondary', borderColor: 'divider', textTransform: 'none' }}>
                                    Upload Cover
                                    <input hidden type="file" accept="image/*" onChange={handleCoverChange} />
                                </Button>
                            )}
                        </Box>
                    )}

                    {/* Image Previews */}
                    {previews.length > 0 && (
                        <Box sx={{ mb: 3, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 2 }}>
                            {previews.map((preview, index) => (
                                <Box key={index} sx={{ position: 'relative', paddingTop: '100%', borderRadius: 2, overflow: 'hidden' }}>
                                    {files[index] && files[index].type.startsWith('video/') ? (
                                        <video
                                            src={preview}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                            muted
                                        />
                                    ) : (
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    )}
                                    <IconButton
                                        onClick={() => removeFile(index)}
                                        sx={{
                                            position: 'absolute',
                                            top: 5,
                                            right: 5,
                                            bgcolor: 'rgba(0,0,0,0.7)',
                                            color: 'white',
                                            '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' },
                                            width: 28,
                                            height: 28
                                        }}
                                        size="small"
                                    >
                                        <Close fontSize="small" />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button
                            component="label"
                            startIcon={<ImageIcon />}
                            sx={{
                                color: 'primary.main',
                                textTransform: 'none',
                                fontWeight: 600,
                                '&:hover': { bgcolor: 'action.hover' }
                            }}
                        >
                            {creationMode === 'reel' ? 'Add Video' : 'Add Photos/Videos'}
                            <input
                                hidden
                                accept={creationMode === 'reel' ? "video/*" : "image/*,video/*"}
                                type="file"
                                multiple
                                onChange={handleFileChange}
                            />
                        </Button>

                        {creationMode === 'stream' && streamType === 'non-live' && (
                            <Button
                                component="label"
                                startIcon={<ImageIcon />}
                                sx={{
                                    color: 'primary.main',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >
                                Upload Video
                                <input
                                    hidden
                                    accept="video/*"
                                    type="file"
                                    onChange={handleFileChange}
                                />
                            </Button>
                        )}

                        <Button
                            variant="contained"
                            onClick={creationMode === 'stream' ? handleCreateStream : handleShare}
                            disabled={loading || (creationMode !== 'stream' && !text && files.length === 0)}
                            sx={{
                                bgcolor: 'primary.main',
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 4,
                                '&:hover': { bgcolor: 'primary.dark' },
                                '&.Mui-disabled': { bgcolor: 'action.disabledBackground' }
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : (creationMode === 'reel' ? 'Share Reel' : creationMode === 'stream' ? 'Start Streaming' : 'Share')}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default CreatePost;
