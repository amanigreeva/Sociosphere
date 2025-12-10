import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Checkbox,
    Avatar,
    IconButton,
    Typography,
    Box,
    Tab,
    Tabs,
    Divider
} from '@mui/material';
import { CameraAlt, PersonAdd, Delete, ExitToApp, Check, Edit, Close, Info, Group, Image as ImageIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const GroupDetailsModal = ({ open, onClose, conversation, allFriends, onUpdateGroup, onDeleteChat }) => {
    const { user, token } = useAuth();
    const [activeTab, setActiveTab] = useState(0); // 0: Overview, 1: Members
    const [groupName, setGroupName] = useState("");
    const [isEditingName, setIsEditingName] = useState(false);
    const [selectedNewMembers, setSelectedNewMembers] = useState([]);
    const [previewImage, setPreviewImage] = useState("");
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        if (conversation) {
            setGroupName(conversation.name || "");
            setPreviewImage(conversation.groupImage || "");
        }
    }, [conversation]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSaveName = () => {
        onUpdateGroup({ name: groupName });
        setIsEditingName(false);
    };

    const handleSaveImage = async () => {
        if (!imageFile) return;
        const formData = new FormData();
        formData.append('file', imageFile);
        try {
            const uploadRes = await axios.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const imageUrl = uploadRes.data.url; // Adjust if backend returns differently
            onUpdateGroup({ groupImage: imageUrl });
            setImageFile(null); // Reset
        } catch (err) {
            console.error("Error uploading group image:", err);
        }
    };

    const handleAddMembers = () => {
        if (selectedNewMembers.length === 0) return;
        onUpdateGroup({ members: selectedNewMembers });
        setSelectedNewMembers([]);
    };

    const handleToggleMember = (friendId) => {
        setSelectedNewMembers(prev =>
            prev.includes(friendId)
                ? prev.filter(id => id !== friendId)
                : [...prev, friendId]
        );
    };

    const getGroupMembers = () => {
        if (!conversation || !allFriends) return [];
        return conversation.members.map(memberId => {
            if (memberId === user._id) return { ...user, isMe: true };
            return allFriends.find(f => f._id === memberId) || { _id: memberId, username: "Unknown User" };
        });
    };

    // Filter friends who are NOT already in the group
    const getAvailableFriends = () => {
        if (!conversation || !allFriends) return [];
        return allFriends.filter(f => !conversation.members.includes(f._id));
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{
            style: { backgroundColor: '#202020', color: 'white', height: '600px', display: 'flex' }
        }}>
            <Box sx={{ display: 'flex', height: '100%', width: '100%' }}>
                {/* Sidebar */}
                <Box sx={{ width: '250px', borderRight: '1px solid #333', bgcolor: '#252525', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Info sx={{ color: '#0095f6' }} />
                        <Typography variant="h6" fontWeight="bold">Details</Typography>
                    </Box>
                    <Tabs
                        orientation="vertical"
                        value={activeTab}
                        onChange={handleTabChange}
                        sx={{
                            '& .MuiTab-root': { color: '#aaa', alignItems: 'flex-start', textAlign: 'left', pl: 3, textTransform: 'none', fontSize: '1rem' },
                            '& .Mui-selected': { color: '#fff', bgcolor: '#333', borderLeft: '4px solid #0095f6' },
                            '& .MuiTabs-indicator': { display: 'none' }
                        }}
                    >
                        <Tab icon={<Info sx={{ fontSize: 20, mr: 1 }} />} iconPosition="start" label="Overview" />
                        <Tab icon={<Group sx={{ fontSize: 20, mr: 1 }} />} iconPosition="start" label="Members" />
                    </Tabs>

                    <Box sx={{ flexGrow: 1 }} />
                    <Button
                        startIcon={<Delete />}
                        color="error"
                        sx={{ m: 2, justifyContent: 'flex-start' }}
                        onClick={() => {
                            const isAdmin = conversation?.admin === user._id;
                            onDeleteChat(conversation._id, isAdmin && conversation?.isGroup); // Pass true for hardDelete
                            onClose();
                        }}
                    >
                        {conversation?.isGroup
                            ? (conversation?.admin === user._id ? "Delete Group" : "Leave Group")
                            : "Delete Chat"}
                    </Button>
                </Box>

                {/* Content Area */}
                <Box sx={{ flexGrow: 1, p: 4, overflow: 'auto' }}>

                    {/* Overview Tab */}
                    {activeTab === 0 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                            <Box sx={{ position: 'relative' }}>
                                <Avatar
                                    src={previewImage || "https://cdn-icons-png.flaticon.com/512/166/166258.png"}
                                    sx={{ width: 120, height: 120, border: '4px solid #333' }}
                                />
                                <label htmlFor="group-image-upload">
                                    <input
                                        accept="image/*"
                                        id="group-image-upload"
                                        type="file"
                                        hidden
                                        onChange={handleImageChange}
                                    />
                                    <IconButton
                                        component="span"
                                        sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            right: 0,
                                            bgcolor: '#0095f6',
                                            color: 'white',
                                            '&:hover': { bgcolor: '#007bb5' }
                                        }}
                                    >
                                        <CameraAlt />
                                    </IconButton>
                                </label>
                            </Box>

                            {imageFile && (
                                <Button variant="contained" size="small" onClick={handleSaveImage}>
                                    Save New Image
                                </Button>
                            )}

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {isEditingName ? (
                                    <>
                                        <TextField
                                            value={groupName}
                                            onChange={(e) => setGroupName(e.target.value)}
                                            variant="standard"
                                            InputProps={{ style: { color: 'white', fontSize: '1.5rem', textAlign: 'center' } }}
                                        />
                                        <IconButton onClick={handleSaveName} sx={{ color: '#4caf50' }}><Check /></IconButton>
                                        <IconButton onClick={() => setIsEditingName(false)} sx={{ color: '#f44336' }}><Close /></IconButton>
                                    </>
                                ) : (
                                    <>
                                        <Typography variant="h4" fontWeight="bold">{conversation?.name || "Group Chat"}</Typography>
                                        <IconButton onClick={() => setIsEditingName(true)} sx={{ color: '#aaa' }}><Edit /></IconButton>
                                    </>
                                )}
                            </Box>

                            <Box sx={{ width: '100%', mt: 4 }}>
                                <Typography variant="h6" sx={{ mb: 2, color: '#aaa' }}>Statistics</Typography>
                                <Box sx={{ display: 'flex', gap: 4, bgcolor: '#252525', p: 3, borderRadius: 2 }}>
                                    <Box>
                                        <Typography color="gray" variant="body2">Created</Typography>
                                        <Typography variant="body1">{new Date(conversation?.createdAt).toLocaleDateString()}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography color="gray" variant="body2">Members</Typography>
                                        <Typography variant="body1">{conversation?.members?.length || 0}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography color="gray" variant="body2">Admin</Typography>
                                        <Typography variant="body1">
                                            {
                                                // Find admin name if possible, else show ID or "Me"
                                                conversation?.admin === user._id ? "You" : "Unknown"
                                            }
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    )}

                    {/* Members Tab */}
                    {activeTab === 1 && (
                        <Box>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" sx={{ mb: 1 }}>Add New Members</Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                    {getAvailableFriends().slice(0, 5).map(f => ( // Limit display for cleaner UI
                                        <Box
                                            key={f._id}
                                            onClick={() => handleToggleMember(f._id)}
                                            sx={{
                                                p: 1, border: '1px solid #444', borderRadius: 1,
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1,
                                                bgcolor: selectedNewMembers.includes(f._id) ? '#0095f6' : 'transparent'
                                            }}
                                        >
                                            <Avatar src={f.profilePicture} sx={{ width: 24, height: 24 }} />
                                            <Typography variant="body2">{f.username}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                                <Button
                                    disabled={selectedNewMembers.length === 0}
                                    onClick={handleAddMembers}
                                    variant="contained"
                                    startIcon={<PersonAdd />}
                                >
                                    Add Selected
                                </Button>
                            </Box>

                            <Divider sx={{ bgcolor: '#444', mb: 2 }} />

                            <Typography variant="h6" sx={{ mb: 2 }}>Current Members ({conversation?.members?.length})</Typography>
                            <List>
                                {getGroupMembers().map((member, index) => (
                                    <ListItem key={index}>
                                        <ListItemAvatar>
                                            <Avatar src={member.profilePicture || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography color="white">
                                                    {member.username}
                                                    {member.isMe && <span style={{ color: '#888', marginLeft: '8px' }}>(You)</span>}
                                                    {conversation?.admin === member._id && <span style={{ color: '#f50057', marginLeft: '8px', fontSize: '0.8em', border: '1px solid #f50057', borderRadius: '4px', padding: '0 4px' }}>Admin</span>}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}
                </Box>
            </Box>
        </Dialog>
    );
};

export default GroupDetailsModal;
