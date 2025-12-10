import React from 'react';
import { Box, Typography, Grid } from '@mui/material';

export default function Explore() {
    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Explore</Typography>
            <Grid container spacing={2}>
                {/* Placeholder for explore grid */}
                {[1, 2, 3, 4, 5, 6].map((item) => (
                    <Grid item xs={4} key={item}>
                        <Box
                            sx={{
                                width: '100%',
                                paddingTop: '100%', // 1:1 Aspect Ratio
                                bgcolor: '#f0f0f0',
                                position: 'relative'
                            }}
                        >
                            <Typography
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    color: '#8e8e8e'
                                }}
                            >
                                Post {item}
                            </Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
