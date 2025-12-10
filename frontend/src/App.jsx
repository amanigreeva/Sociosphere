// frontend/src/App.jsx
import React, { useContext, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { ThemeContextProvider, ThemeContext } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Explore from './pages/Explore';
import Chat from './pages/Chat';
import Notifications from './pages/Notifications';
import NotificationBar from './components/NotificationBar';
import Reels from './pages/Reels';
import Search from './pages/Search';
import Analytics from './pages/Analytics';
import Activity from './pages/Activity'; // Activity Page
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import SavedPosts from './pages/SavedPosts';
import Streaming from './pages/Streaming';

// Layout & Routes
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

const AppContent = () => {
  const { darkMode } = useContext(ThemeContext);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      background: {
        default: darkMode ? '#000000' : '#ffffff',
        paper: darkMode ? '#1e1e1e' : '#f5f5f5',
      },
      text: {
        primary: darkMode ? '#ffffff' : '#000000',
        secondary: darkMode ? '#b0b0b0' : '#666666',
      }
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: darkMode ? "#6b6b6b #2b2b2b" : "#959595 #f5f5f5",
            "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
              backgroundColor: darkMode ? "#2b2b2b" : "#f5f5f5",
              width: "8px",
            },
            "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
              borderRadius: 8,
              backgroundColor: darkMode ? "#6b6b6b" : "#959595",
              minHeight: 24,
            },
            "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
              backgroundColor: darkMode ? "#959595" : "#6b6b6b",
            },
            "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active": {
              backgroundColor: darkMode ? "#959595" : "#6b6b6b",
            },
            "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
              backgroundColor: darkMode ? "#959595" : "#6b6b6b",
            },
          },
        },
      },
    }
  }), [darkMode]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, [darkMode]);


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme={darkMode ? 'dark' : 'light'} />
      <Router>
        <AuthProvider>
          <NotificationBar />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>} />
            <Route path="/profile/:username" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
            <Route path="/explore" element={<ProtectedRoute><Layout><Explore /></Layout></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Layout><Chat /></Layout></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Layout><Notifications /></Layout></ProtectedRoute>} />

            <Route path="/reels" element={<ProtectedRoute><Layout><Reels /></Layout></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><Layout><Search /></Layout></ProtectedRoute>} />
            <Route path="/create" element={<ProtectedRoute><Layout><CreatePost /></Layout></ProtectedRoute>} />
            <Route path="/post/:id" element={<ProtectedRoute><Layout><PostDetail /></Layout></ProtectedRoute>} />
            <Route path="/saved" element={<ProtectedRoute><Layout><SavedPosts /></Layout></ProtectedRoute>} />
            {/* Analytics route - optional graph per user request */}
            <Route path="/analytics" element={<ProtectedRoute><Layout><Analytics /></Layout></ProtectedRoute>} />
            <Route path="/activity" element={<ProtectedRoute><Layout><Activity /></Layout></ProtectedRoute>} />
            <Route path="/streaming" element={<ProtectedRoute><Layout><Streaming /></Layout></ProtectedRoute>} />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

function App() {
  return (
    <ThemeContextProvider>
      <AppContent />
    </ThemeContextProvider>
  );
}

export default App;