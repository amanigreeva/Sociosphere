import React, { useContext, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Box, Typography, Modal, TextField, Button, Switch, Divider, IconButton, useTheme, Avatar } from '@mui/material';
import { ArrowBack, Close, Add } from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';

const SettingsModal = ({ open, onClose }) => {
    const { darkMode, dispatch } = useContext(ThemeContext);
    const { user: currentUser, token, savedAccounts, switchAccount, removeAccount, prepareAddAccount, logout } = useAuth();
    const theme = useTheme();
    const navigate = useNavigate();

    // Internal navigation state: 'menu' | 'password_verify' | 'password_new' | 'downloads' | 'delete_confirm'
    const [view, setView] = useState('menu');

    const handleDeleteAccount = async () => {
        try {
            await axios.delete(`/api/users/${currentUser._id}`, {
                headers: { 'x-auth-token': token }
            });
            toast.success("Account deleted successfully");
            handleClose();
            logout(); // Use context logout
            // navigate('/register'); // logout usually redirects
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete account");
        }
    };

    // Password Form State
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const resetState = () => {
        setView('menu');
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const verifyOldPassword = async () => {
        try {
            await axios.post('/api/auth/login', { email: currentUser.email, password: oldPassword });
            setView('password_new');
        } catch (err) {
            toast.error("Incorrect password");
        }
    };

    const handleChangePassword = async () => {
        // console.log("handleChangePassword called"); // DEBUG
        // console.log("Old:", oldPassword, "New:", newPassword, "Confirm:", confirmPassword); // DEBUG

        if (newPassword !== confirmPassword) {
            // console.log("Passwords do not match"); // DEBUG
            toast.error("New passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            // console.log("Password too short"); // DEBUG
            toast.error("Password must be at least 6 characters");
            return;
        }

        try {
            // console.log("Sending API request..."); // DEBUG
            await axios.put(`/api/users/${currentUser._id}/password`, {
                oldPassword,
                newPassword
            }, {
                headers: { 'x-auth-token': token }
            });
            // console.log("API Success"); // DEBUG
            toast.success("Password changed successfully");
            handleClose();
            navigate('/'); // Redirect to home page
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data || "Failed to change password");
        }
    };

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderRadius: 4,
        boxShadow: 24,
        p: 0, // Reset padding for custom layout
        overflow: 'hidden'
    };

    const headerStyle = {
        p: 2,
        borderBottom: 1,
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="settings-modal-title"
        >
            <Box sx={modalStyle}>

                {/* Header */}
                <Box sx={headerStyle}>
                    {view !== 'menu' && (
                        <IconButton onClick={() => setView('menu')} sx={{ color: 'inherit' }}>
                            <ArrowBack />
                        </IconButton>
                    )}
                    <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1, textAlign: 'center', ml: view !== 'menu' ? -5 : 0 }}>
                        {view === 'menu' ? 'Settings' : (view === 'downloads' ? 'Downloads' : (view === 'delete_confirm' ? 'Delete Account' : 'Change Password'))}
                    </Typography>
                    <IconButton onClick={handleClose} sx={{ color: 'inherit' }}>
                        <Close />
                    </IconButton>
                </Box>

                {/* Content */}
                <Box sx={{ p: 3 }}>

                    {view === 'menu' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

                            {/* Switch Accounts Section */}
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                    Switch Accounts
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {savedAccounts?.map((account) => (
                                        <Box
                                            key={account._id}
                                            onClick={() => account._id !== currentUser._id && switchAccount(account._id)}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                p: 1,
                                                borderRadius: 2,
                                                cursor: account._id !== currentUser._id ? 'pointer' : 'default',
                                                bgcolor: account._id === currentUser._id ? 'action.selected' : 'transparent',
                                                '&:hover': {
                                                    bgcolor: 'action.hover'
                                                }
                                            }}
                                        >
                                            <Avatar
                                                src={account.profilePicture || "/assets/person/noAvatar.png"}
                                                sx={{ width: 32, height: 32, mr: 1.5 }}
                                            />
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="body2" fontWeight={account._id === currentUser._id ? 'bold' : 'normal'}>
                                                    {account.username}
                                                </Typography>
                                                {account._id === currentUser._id && (
                                                    <Typography variant="caption" color="success.main">Active</Typography>
                                                )}
                                            </Box>

                                            {/* Remove account button */}
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeAccount(account._id);
                                                }}
                                            >
                                                <Close fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    ))}

                                    <Button
                                        startIcon={<Add />}
                                        onClick={() => {
                                            prepareAddAccount();
                                            handleClose();
                                        }}
                                        sx={{
                                            justifyContent: 'flex-start',
                                            textTransform: 'none',
                                            ml: 0.5
                                        }}
                                    >
                                        Add account
                                    </Button>
                                </Box>
                            </Box>

                            <Divider />

                            {/* Downloads */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography>Downloads</Typography>
                                <Button
                                    onClick={() => setView('downloads')}
                                    variant="outlined"
                                    size="small"
                                >
                                    View
                                </Button>
                            </Box>

                            <Divider />

                            {/* Change Password */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography>Password</Typography>
                                <Button onClick={() => setView('password_verify')}>Change</Button>
                            </Box>

                            <Divider />

                            {/* Delete Account */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography color="error">Delete Account</Typography>
                                <Button color="error" variant="outlined" size="small" onClick={() => setView('delete_confirm')}>Delete</Button>
                            </Box>
                        </Box>
                    )}

                    {view === 'password_verify' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                To secure your account, please enter your current password first.
                            </Typography>
                            <TextField
                                label="Current Password"
                                type="password"
                                fullWidth
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                            />
                            <Button
                                variant="contained"
                                onClick={verifyOldPassword}
                                disabled={!oldPassword}
                                sx={{ mt: 1 }}
                            >
                                Next
                            </Button>
                        </Box>
                    )}

                    {view === 'password_new' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                create a strong password.
                            </Typography>
                            <TextField
                                label="New Password"
                                type="password"
                                fullWidth
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <TextField
                                label="Confirm New Password"
                                type="password"
                                fullWidth
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <Button
                                variant="contained"
                                onClick={handleChangePassword}
                                disabled={!newPassword || !confirmPassword}
                                sx={{ mt: 1 }}
                            >
                                Change Password
                            </Button>
                        </Box>
                    )}

                    {view === 'downloads' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, maxHeight: '300px' }}>
                                {(() => {
                                    const items = JSON.parse(localStorage.getItem('downloadedItems') || '[]');
                                    if (items.length === 0) {
                                        return (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, color: 'text.secondary' }}>
                                                <Typography>No downloads yet.</Typography>
                                            </Box>
                                        );
                                    }
                                    return items.map((item, index) => (
                                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', p: 1, gap: 2, mb: 1, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}>
                                            <Avatar src={item.userAvatar || "/assets/person/noAvatar.png"} sx={{ width: 40, height: 40 }} />
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="body2" fontWeight="bold">{item.username}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {item.type} • {new Date(item.downloadedAt).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                            {/* External Link icon to open original media if valid url */}
                                            {item.mediaUrl && (
                                                <Button size="small" href={item.mediaUrl} target="_blank" sx={{ minWidth: 'auto' }}>
                                                    View
                                                </Button>
                                            )}
                                        </Box>
                                    ));
                                })()}
                            </Box>
                            {/* Clear History */}
                            <Button
                                color="error"
                                fullWidth
                                variant="outlined"
                                onClick={() => {
                                    localStorage.removeItem('downloadedItems');
                                    // Force re-render simple hack or manage state properly (simplest here is re-render via route or just toast)
                                    toast.success("Download history cleared");
                                    setView('menu'); // Go back to refresh
                                }}
                            >
                                Clear History
                            </Button>
                        </Box>
                    )}

                    {view === 'delete_confirm' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, textAlign: 'center', py: 2 }}>
                            <Box sx={{ color: 'error.main' }}>
                                <Typography variant="h5" fontWeight="bold" gutterBottom>
                                    Delete Account?
                                </Typography>
                                <Typography variant="body1">
                                    This action is permanent and cannot be undone. All your posts, messages, and data will be lost forever.
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Button
                                    variant="contained"
                                    color="error"
                                    fullWidth
                                    onClick={handleDeleteAccount}
                                    sx={{ fontWeight: 'bold' }}
                                >
                                    Delete Permanently
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    fullWidth
                                    onClick={() => setView('menu')}
                                >
                                    Cancel
                                </Button>
                            </Box>
                        </Box>
                    )}

                </Box>
            </Box >
        </Modal >
    );
};

export default SettingsModal;
