import React, { useState } from 'react';
import { Box, Modal, Typography, TextField, Button, IconButton, Backdrop, Fade } from '@mui/material';
import { Close, Send } from '@mui/icons-material';
import { toast } from 'react-toastify';

const ReportProblemModal = ({ open, onClose, target = 'General Problem' }) => {
    const [description, setDescription] = useState('');
    const [sending, setSending] = useState(false);

    const handleSubmit = async () => {
        if (!description.trim()) {
            toast.error("Please describe the issue.");
            return;
        }

        setSending(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log(`Report submitted for [${target}]:`, description);
            toast.success("Report sent details received we will review it.");

            setDescription('');
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Failed to send report.");
        } finally {
            setSending(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{ timeout: 500 }}
        >
            <Fade in={open}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '90%', sm: 400 },
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    boxShadow: 24,
                    p: 3,
                    outline: 'none',
                    color: 'text.primary'
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                            Report {target !== 'General Problem' ? 'Issue' : 'Problem'}
                        </Typography>
                        <IconButton onClick={onClose} sx={{ color: 'text.primary' }}>
                            <Close />
                        </IconButton>
                    </Box>

                    {target !== 'General Problem' && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Reporting: <strong>{target}</strong>
                        </Typography>
                    )}

                    <TextField
                        placeholder="Please describe the issue or reason for reporting..."
                        multiline
                        rows={5}
                        fullWidth
                        variant="outlined"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        sx={{
                            mb: 3,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                color: 'text.primary'
                            }
                        }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button onClick={onClose} sx={{ color: 'text.secondary' }}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            endIcon={<Send />}
                            onClick={handleSubmit}
                            disabled={sending}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 'bold'
                            }}
                        >
                            {sending ? 'Sending...' : 'Send Report'}
                        </Button>
                    </Box>
                </Box>
            </Fade>
        </Modal>
    );
};

export default ReportProblemModal;
