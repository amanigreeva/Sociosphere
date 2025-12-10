import React, { useState } from 'react';
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
    Avatar,
    Checkbox,
    Typography,
    Box
} from '@mui/material';

const CreateGroupModal = ({ open, onClose, friends, onCreateGroup }) => {
    const [groupName, setGroupName] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);

    const handleToggleMember = (friendId) => {
        setSelectedMembers(prev =>
            prev.includes(friendId)
                ? prev.filter(id => id !== friendId)
                : [...prev, friendId]
        );
    };

    const handleCreate = () => {
        if (!groupName.trim()) return;
        if (selectedMembers.length < 2) {
            alert("Please select at least 2 members for a group.");
            return;
        }
        onCreateGroup(groupName, selectedMembers);
        setGroupName("");
        setSelectedMembers([]);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ bgcolor: '#202020', color: 'white' }}>Create New Group</DialogTitle>
            <DialogContent sx={{ bgcolor: '#252525', color: 'white' }}>
                <Box sx={{ mt: 2, mb: 2 }}>
                    <TextField
                        fullWidth
                        label="Group Name"
                        variant="outlined"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        sx={{
                            input: { color: 'white' },
                            label: { color: 'gray' },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#444' },
                                '&:hover fieldset': { borderColor: '#666' },
                                '&.Mui-focused fieldset': { borderColor: '#0095f6' },
                            }
                        }}
                    />
                </Box>
                <Typography variant="subtitle1" sx={{ mb: 1, color: '#ccc' }}>Select Members</Typography>
                <List sx={{ maxHeight: 300, overflow: 'auto', bgcolor: '#333', borderRadius: 1 }}>
                    {friends.map(friend => (
                        <ListItem key={friend._id} button onClick={() => handleToggleMember(friend._id)}>
                            <ListItemAvatar>
                                <Avatar src={friend.profilePicture || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={friend.username}
                                secondary={friend.name}
                                primaryTypographyProps={{ color: 'white' }}
                                secondaryTypographyProps={{ color: 'gray' }}
                            />
                            <Checkbox
                                edge="end"
                                checked={selectedMembers.includes(friend._id)}
                                tabIndex={-1}
                                disableRipple
                                sx={{ color: 'gray', '&.Mui-checked': { color: '#0095f6' } }}
                            />
                        </ListItem>
                    ))}
                    {friends.length === 0 && (
                        <ListItem>
                            <ListItemText primary="No friends found" sx={{ color: 'gray', textAlign: 'center' }} />
                        </ListItem>
                    )}
                </List>
            </DialogContent>
            <DialogActions sx={{ bgcolor: '#202020', p: 2 }}>
                <Button onClick={onClose} sx={{ color: 'gray' }}>Cancel</Button>
                <Button
                    onClick={handleCreate}
                    variant="contained"
                    disabled={!groupName.trim() || selectedMembers.length < 2}
                    sx={{ bgcolor: '#0095f6', '&:hover': { bgcolor: '#007bb5' } }}
                >
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateGroupModal;
