import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

const isVideo = (url) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.mov', '.webm', '.ogg'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
};

import ReelItem from '../components/ReelItem';

const Reels = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // Use explore/all to show a global discovery feed of reels, not just friends
                const res = await axios.get('/api/posts/explore/all');
                // Filter specifically for videos
                const videoPosts = res.data.filter(p => {
                    const media = (p.media && p.media.length > 0) ? p.media[0] : p.image;
                    return isVideo(media);
                });
                setPosts(videoPosts);
            } catch (err) {
                console.error("Error fetching reels", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    // Intersection Observer to track active reel
    useEffect(() => {
        const options = {
            root: containerRef.current,
            threshold: 0.6 // 60% of item must be visible
        };

        const handleScroll = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const index = Number(entry.target.getAttribute('data-index'));
                    setActiveIndex(index);
                }
            });
        };

        const observer = new IntersectionObserver(handleScroll, options);

        const items = document.querySelectorAll('.reel-item');
        items.forEach(item => observer.observe(item));

        return () => observer.disconnect();
    }, [posts]);

    return (
        <Box sx={{ display: 'flex', bgcolor: 'background.default', height: '100vh', color: 'text.primary', overflow: 'hidden' }}>
            <Sidebar />
            <Box sx={{ flex: 1, marginLeft: '72px', display: 'flex', justifyContent: 'center', height: '100%' }}>
                <Box
                    ref={containerRef}
                    sx={{
                        width: '100%',
                        maxWidth: '450px', // Standard mobile width
                        height: '100%', // Full height of parent
                        overflowY: 'scroll',
                        scrollSnapType: 'y mandatory',
                        '&::-webkit-scrollbar': { display: 'none' }, // Hide scrollbar
                        scrollbarWidth: 'none'
                    }}
                >
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                            <CircularProgress color="inherit" />
                        </Box>
                    ) : posts.length > 0 ? (
                        posts.map((p, index) => (
                            <Box key={p._id} className="reel-item" data-index={index}>
                                <ReelItem post={p} isActive={index === activeIndex} />
                            </Box>
                        ))
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                            <Typography variant="h6">No Reels Yet</Typography>
                            <Typography variant="body2" color="text.secondary">Upload a video to see it here</Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default Reels;
