import React, { useRef } from 'react';
import { Box, Chip, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const categories = [
    { id: 'ALL', label: 'All', icon: '🌟' },
    { id: 'GYM', label: 'Gym', icon: '💪' },
    { id: 'FOOD', label: 'Food', icon: '🍔' },
    { id: 'ACT', label: 'Acting', icon: '🎭' },
    { id: 'ART', label: 'Art', icon: '🎨' },
    { id: 'MOVIES', label: 'Movies', icon: '🎬' },
    { id: 'PRODUCTS', label: 'Products', icon: '📦' },
    { id: 'TECH', label: 'Tech', icon: '💻' },
    { id: 'GAMING', label: 'Gaming', icon: '🎮' },
];

const CategoryTabs = ({ activeCategory, onCategoryChange }) => {
    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <Box
            sx={{
                position: 'relative',
                mb: 4,
                width: '100%',
            }}
        >
            {/* Left Arrow */}
            <IconButton
                onClick={() => scroll('left')}
                sx={{
                    position: 'absolute',
                    left: -20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    zIndex: 2,
                    boxShadow: 2,
                    '&:hover': {
                        bgcolor: 'action.hover',
                    },
                    width: 40,
                    height: 40,
                }}
            >
                <ChevronLeft />
            </IconButton>

            {/* Scrollable Container */}
            <Box
                ref={scrollContainerRef}
                sx={{
                    display: 'flex',
                    gap: 1.5,
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    scrollBehavior: 'smooth',
                    pb: 1,
                    px: 1,
                    // Hide scrollbar but keep functionality
                    '&::-webkit-scrollbar': {
                        display: 'none',
                    },
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none',
                    // Prevent text selection during scroll
                    userSelect: 'none',
                }}
            >
                {categories.map((category) => (
                    <Chip
                        key={category.id}
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, whiteSpace: 'nowrap' }}>
                                <span>{category.icon}</span>
                                <span>{category.label}</span>
                            </Box>
                        }
                        onClick={() => onCategoryChange(category.id)}
                        sx={{
                            bgcolor: activeCategory === category.id ? 'primary.main' : 'action.selected',
                            color: activeCategory === category.id ? 'primary.contrastText' : 'text.primary',
                            fontWeight: 600,
                            px: 2.5,
                            py: 2.5,
                            fontSize: '14px',
                            cursor: 'pointer',
                            flexShrink: 0,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                bgcolor: activeCategory === category.id ? 'primary.dark' : 'action.hover',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            },
                        }}
                    />
                ))}
            </Box>

            {/* Right Arrow */}
            <IconButton
                onClick={() => scroll('right')}
                sx={{
                    position: 'absolute',
                    right: -20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    zIndex: 2,
                    boxShadow: 2,
                    '&:hover': {
                        bgcolor: 'action.hover',
                    },
                    width: 40,
                    height: 40,
                }}
            >
                <ChevronRight />
            </IconButton>
        </Box>
    );
};

export default CategoryTabs;
