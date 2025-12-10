// frontend/src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Box, Typography } from '@mui/material';
import Rightbar from '../components/Rightbar';
import Sidebar from '../components/Sidebar';
import StreamingHeroSlider from '../components/StreamingHeroSlider';
import CategoryTabs from '../components/CategoryTabs';
import CategoryReels from '../components/CategoryReels';

export default function Home() {
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [streams, setStreams] = useState([]);
    const { token } = useAuth(); // Need token for API

    useEffect(() => {
        const fetchStreams = async () => {
            try {
                // Fetch random or featured streams for the home slider
                const res = await axios.get('/api/streams', {
                    headers: { 'x-auth-token': token }
                });
                setStreams(res.data);
            } catch (err) {
                console.error("Error fetching home streams:", err);
            }
        };
        if (token) fetchStreams();
    }, [token]);

    return (
        <Box sx={{
            display: 'flex',
            bgcolor: 'background.default',
            minHeight: '100vh',
            color: 'text.primary'
        }}>
            {/* Sidebar - fixed position */}
            <Sidebar />

            {/* Main Content Area */}
            <Box sx={{
                marginLeft: '72px',
                flex: 1,
                py: 3,
                px: 3,
                bgcolor: 'background.default',
                minHeight: '100vh',
                overflowY: 'auto',
            }}>
                {/* Hero and Suggestions Row - Fixed Size */}
                <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
                    {/* Streaming Hero - Fixed Width */}
                    <Box sx={{ flex: '0 0 75%' }}>
                        <StreamingHeroSlider streams={streams} />
                    </Box>

                    {/* Suggestions - Fixed Width */}
                    <Box sx={{ flex: '0 0 calc(25% - 24px)' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                            Suggested For You
                        </Typography>
                        <Rightbar />
                    </Box>
                </Box>

                {/* Category Tabs */}
                <CategoryTabs
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                />

                {/* Category Content */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
                        {activeCategory === 'ALL' ? 'Trending Now' : `${activeCategory} Content`}
                    </Typography>
                    <CategoryReels category={activeCategory} />
                </Box>
            </Box>
        </Box>
    );
}
