import React, { useState, useEffect } from 'react';
import { Box, Typography, ToggleButton, ToggleButtonGroup, useTheme, Tooltip } from '@mui/material';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Analytics = () => {
    const [timeRange, setTimeRange] = useState('thisWeek');
    const [selectedDay, setSelectedDay] = useState(null);
    const theme = useTheme();

    const handleTimeRangeChange = (event, newRange) => {
        if (newRange !== null) {
            setTimeRange(newRange);
            setSelectedDay(null);
        }
    };

    // Formatter
    const formatHours = (hours) => {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h} hr, ${m} min`;
    };

    // State for real data
    const [weeklyData, setWeeklyData] = useState([]);
    const [loading, setLoading] = useState(true);

    const { token } = useAuth(); // Import useAuth to get token

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!token) return;
            try {
                const res = await axios.get('/api/analytics/weekly', {
                    headers: { 'x-auth-token': token }
                });
                setWeeklyData(res.data);
            } catch (err) {
                console.error("Error fetching analytics:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [token]);

    const data = {
        thisWeek: weeklyData.length > 0 ? weeklyData : [],
        lastWeek: [] // Placeholder for now or implement endpoint for last week too
    };

    const currentData = data[timeRange];

    // Dynamic Header Logic
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayName = days[new Date().getDay()];
    const currentDayData = currentData.find(d => d.day === todayName);
    const displayTime = selectedDay
        ? formatHours(selectedDay.hours)
        : (timeRange === 'thisWeek' ? formatHours(currentDayData?.hours || 0) : '0 hr, 0 min');

    const displayLabel = selectedDay
        ? selectedDay.day
        : (timeRange === 'thisWeek' ? 'Today' : 'Last Week Average');


    return (
        <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh', color: 'text.primary' }}>
            <Sidebar />
            <Box sx={{
                flex: 1,
                marginLeft: '72px',
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                overflowY: 'auto'
            }}>
                {/* Header Section */}
                <Box sx={{ width: '100%', maxWidth: 600, mb: 2, textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>App activity details</Typography>
                </Box>

                <Box sx={{ width: '100%', maxWidth: 600, mb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <ToggleButtonGroup
                        value={timeRange}
                        exclusive
                        onChange={handleTimeRangeChange}
                        aria-label="time range"
                        sx={{
                            mb: 2,
                            bgcolor: 'background.paper',
                            '& .MuiToggleButton-root': {
                                color: 'text.secondary',
                                px: 3,
                                py: 0.5,
                                textTransform: 'none',
                                borderRadius: '20px !important',
                                border: '1px solid',
                                borderColor: 'divider',
                                mx: 1,
                                '&.Mui-selected': {
                                    color: 'text.primary',
                                    bgcolor: 'action.selected',
                                    borderColor: 'text.primary',
                                }
                            }
                        }}
                    >
                        <ToggleButton value="thisWeek" sx={{ border: 'none' }}>This Week</ToggleButton>
                        <ToggleButton value="lastWeek" sx={{ border: 'none' }}>Last Week</ToggleButton>
                    </ToggleButtonGroup>

                    <Typography variant="h3" fontWeight="normal" sx={{ mb: 0.5 }}>
                        {displayTime}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {displayLabel}
                    </Typography>
                </Box>

                {/* Main Weekly Chart */}
                <Box sx={{
                    width: '100%',
                    maxWidth: 600,
                    bgcolor: 'transparent',
                    mb: 3,
                    position: 'relative'
                }}>
                    {/* Grid Lines */}
                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 30, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 0 }}>
                        {[6, 4, 2, 0].map((val, i) => (
                            <Box key={i} sx={{ borderTop: val > 0 ? `1px solid ${theme.palette.divider}` : `1px solid ${theme.palette.text.secondary}`, width: '100%', height: '1px', position: 'relative' }}>
                                <Typography variant="caption" sx={{ position: 'absolute', right: -25, top: -10, color: 'text.secondary' }}>{val > 0 ? `${val}h` : '0h'}</Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Bars Container */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        height: 200, // Fixed height matching grid
                        zIndex: 1,
                        position: 'relative',
                        pt: '2px' // Adjust for top border
                    }}>
                        {currentData.map((item, index) => (
                            <Box
                                key={index}
                                onClick={() => setSelectedDay(item)}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    width: '10%',
                                    cursor: 'pointer',
                                    height: '100%',
                                    justifyContent: 'flex-end'
                                }}
                            >
                                <Tooltip title={`${formatHours(item.hours)}`} placement="top">
                                    <Box
                                        sx={{
                                            width: '70%',
                                            bgcolor: selectedDay?.day === item.day ? '#ffccbc' : '#ffffff',
                                            opacity: selectedDay?.day === item.day ? 1 : 0.9,
                                            borderRadius: '4px 4px 0 0',
                                            height: `${Math.min((item.hours / 6) * 100, 100)}%`, // Scale based on max 6h, cap at 100%
                                            transition: 'all 0.3s ease',
                                        }}
                                    />
                                </Tooltip>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        mt: 1,
                                        color: selectedDay?.day === item.day ? 'text.primary' : 'text.secondary',
                                        fontSize: '0.75rem'
                                    }}
                                >
                                    {item.day}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>

            </Box>
        </Box>
    );
};

export default Analytics;
