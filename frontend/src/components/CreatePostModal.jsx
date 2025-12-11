import React, { useState } from 'react';
import { Box, Modal, Typography, Button, TextField, IconButton, Avatar, Divider } from '@mui/material';
import { Close, Image, EmojiEmotions, LocationOn } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { makeRequest } from '../axios';
import { toast } from 'react-toastify';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', md: 500 },
    bgcolor: 'background.paper',
    borderRadius: '12px',
    boxShadow: 24,
    p: 0,
    outline: 'none'
};

const CreatePostModal = ({ open, onClose }) => {
    const { user } = useAuth();
    const [desc, setDesc] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async () => {
        if (!desc && !file) return;

        setLoading(true);
        const newPost = {
            userId: user._id,
            text: desc,
        };

        if (file) {
            const data = new FormData();
            const fileName = Date.now() + file.name;
            data.append("name", fileName);
            data.append("file", file);
            newPost.media = [fileName]; // Assuming backend handles this or we upload separately

            try {
                await makeRequest.post("/upload", data);
            } catch (err) {
                console.log(err);
            }
        }

        try {
            await makeRequest.post("/posts", newPost);
            toast.success("Post created successfully!");
            setDesc('');
            setFile(null);
            onClose();
            window.location.reload(); // Simple reload to refresh feed
        } catch (err) {
            console.log(err);
            toast.error("Failed to create post");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="create-post-modal"
        >
            <Box sx={style}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderBottom: '1px solid #dbdbdb' }}>
                    <Typography variant="h6" align="center" sx={{ flexGrow: 1, fontWeight: 600, fontSize: '1rem' }}>
                        Create new post
                    </Typography>
                    <IconButton onClick={onClose} size="small" sx={{ position: 'absolute', right: 8 }}>
                        <Close />
                    </IconButton>
                </Box>

                <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar src={user?.avatar || "/assets/person/noAvatar.png"} sx={{ width: 32, height: 32, mr: 1.5 }} />
                        <Typography fontWeight="600" variant="subtitle2">{user?.username}</Typography>
                    </Box>

                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Write a caption..."
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    {file && (
                        <Box sx={{ mb: 2, position: 'relative' }}>
                            <img src={URL.createObjectURL(file)} alt="" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '4px' }} />
                            <IconButton
                                onClick={() => setFile(null)}
                                sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                                size="small"
                            >
                                <Close fontSize="small" />
                            </IconButton>
                        </Box>
                    )}

                    <Divider sx={{ mb: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <IconButton component="label">
                                <input hidden accept="image/*" type="file" onChange={handleFileChange} />
                                <Image color="primary" />
                            </IconButton>
                            <IconButton>
                                <EmojiEmotions sx={{ color: '#f7b928' }} />
                            </IconButton>
                            <IconButton>
                                <LocationOn sx={{ color: '#f5533d' }} />
                            </IconButton>
                        </Box>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={loading || (!desc && !file)}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                            {loading ? 'Sharing...' : 'Share'}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
};

export default CreatePostModal;
