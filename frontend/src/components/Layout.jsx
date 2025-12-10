// frontend/src/components/Layout.jsx
import React from 'react';
import { Box } from '@mui/material';

const Layout = ({ children }) => {
    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: 'background.default',
            color: 'text.primary'
        }}>
            {children}
        </Box>
    );
};

export default Layout;
