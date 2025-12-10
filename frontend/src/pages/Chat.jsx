import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { io } from "socket.io-client";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "./dark_dm.css"; // Custom overrides
import {
    MainContainer,
    ChatContainer,
    MessageList,
    Message,
    MessageInput,
    Sidebar,
    Search,
    ConversationList,
    Conversation,
    Avatar,
    ConversationHeader,
    VoiceCallButton,
    VideoCallButton,
    InfoButton,
    TypingIndicator,
    MessageSeparator
} from '@chatscope/chat-ui-kit-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Box, Typography, CircularProgress, IconButton, useTheme, Dialog } from '@mui/material';
import { ArrowBack, Add, Group, Edit, Check, Close } from '@mui/icons-material';
import CreateGroupModal from '../components/CreateGroupModal';
import GroupDetailsModal from '../components/GroupDetailsModal';

export default function Chat() {
    const theme = useTheme();
    const [conversations, setConversations] = useState([]);
    const [friends, setFriends] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [loadingChat, setLoadingChat] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    const [searchResults, setSearchResults] = useState([]);
    const [openGroupModal, setOpenGroupModal] = useState(false);
    const [openGroupDetails, setOpenGroupDetails] = useState(false);

    const { user, token } = useAuth();
    const navigate = useNavigate();
    const location = useLocation(); // Add useLocation
    const scrollRef = useRef();
    const fileInputRef = useRef();
    const socket = useRef();

    // Helper function to format time (e.g., "3:45 PM")
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Helper function to format date for separators (e.g., "Today", "Yesterday", "December 7, 2025")
    const formatDateSeparator = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString([], {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    };

    // Helper function to check if two dates are on different days
    const isDifferentDay = (date1, date2) => {
        if (!date1 || !date2) return true;
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return d1.toDateString() !== d2.toDateString();
    };


    // 1. Fetch Conversations
    useEffect(() => {
        const getConversations = async () => {
            if (!user?._id || !token) {
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get(`/api/conversations/${user._id}`, {
                    headers: { 'x-auth-token': token }
                });
                const sortedConversations = res.data.sort((a, b) => {
                    const dateA = new Date(a.lastMessage?.timestamp || a.updatedAt || 0);
                    const dateB = new Date(b.lastMessage?.timestamp || b.updatedAt || 0);
                    return dateB - dateA;
                });
                setConversations(sortedConversations);
            } catch (err) {
                console.error('Error fetching conversations:', err);
            } finally {
                setLoading(false);
            }
        };
        getConversations();
    }, [user?._id, token]);

    // Socket Initialization & Listeners
    useEffect(() => {
        if (user?._id) {
            socket.current = io(import.meta.env.VITE_API_URL || "http://localhost:5000");
            socket.current.emit("addUser", user._id);

            socket.current.on("newConversation", (data) => {
                setConversations(prev => {
                    if (prev.some(c => c._id === data._id)) return prev;
                    return [data, ...prev];
                });
            });

            socket.current.on("deleteConversation", (conversationId) => {
                setConversations(prev => prev.filter(c => c._id !== conversationId));
                if (currentChat?._id === conversationId) setCurrentChat(null);
            });

            // Listen for incoming messages (Real-time update)
            socket.current.on("getMessage", (data) => {
                // Only act if this message belongs to the currently open chat
                if (currentChat?._id === data.conversationId) {
                    setMessages(prev => [...prev, data]);

                    // Optional: Mark as read immediately if window is focused
                    // axios.put(`/api/messages/read/${currentChat._id}`...);
                }

                // Update conversation list preview/unread count
                setConversations(prev => {
                    const updatedConv = prev.find(c => c._id === data.conversationId);
                    if (updatedConv) {
                        const filtered = prev.filter(c => c._id !== data.conversationId);

                        // Calculate new unread count if not current chat
                        let newUnreadCount = updatedConv.unreadCount || {};
                        if (currentChat?._id !== data.conversationId) {
                            // This part is tricky without deep copy/immer, but simple increment suffices for UI
                            // Backend handles accurate count. Frontend just hints.
                            // For now, we rely on refetch or simple +1 if needed.
                        }

                        // Simply move to top with new last message
                        return [{
                            ...updatedConv,
                            lastMessage: {
                                text: data.text || 'Attachment',
                                sender: data.sender,
                                timestamp: new Date()
                            }
                        }, ...filtered];
                    }
                    return prev;
                });
            });
        }
    }, [user, currentChat]); // Added currentChat as dependency to correctly check open chat

    // Handle incoming navigation state (e.g. from "Ask AI" button)
    useEffect(() => {
        if (location.state?.currentChat) {
            setCurrentChat(location.state.currentChat);
            // Clear state to avoid reopening on refresh
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state]);

    // 2. Fetch Friends for Search (and inject AI Bot)
    useEffect(() => {
        const fetchFriends = async () => {
            if (!user?._id || !token) return;
            try {
                // 1. Fetch real friends
                const res = await axios.get(`/api/users/friends/${user._id}`, {
                    headers: { 'x-auth-token': token }
                });
                let uniqueFriends = [...new Map([...res.data.followers, ...res.data.following].map(u => [u._id, u])).values()];

                // 2. Fetch AI Bot
                try {
                    const aiRes = await axios.get('/api/users?username=Classic_AI');
                    const aiUser = aiRes.data;
                    if (aiUser) {
                        // Check if AI is already in friends list (e.g. following)
                        const exists = uniqueFriends.some(f => f._id === aiUser._id);
                        if (!exists) {
                            uniqueFriends.push(aiUser);
                        }
                    }
                } catch (aiErr) {
                    console.error("Could not fetch AI user:", aiErr);
                }

                setFriends(uniqueFriends);
            } catch (err) {
                console.error("Error fetching friends:", err);
            }
        };
        fetchFriends();
    }, [user?._id, token]);

    // 3. Search Logic
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }
        const lowerTerm = searchTerm.toLowerCase();

        // Filter Friends
        const friendResults = friends.filter(f =>
            f.username.toLowerCase().includes(lowerTerm) ||
            (f.name && f.name.toLowerCase().includes(lowerTerm))
        ).map(f => ({ ...f, type: 'user' })); // Add type to distinguish

        // Filter Groups from Conversations
        const groupResults = conversations.filter(c =>
            c.isGroup && c.name && c.name.toLowerCase().includes(lowerTerm)
        ).map(c => ({ ...c, type: 'group' }));

        setSearchResults([...groupResults, ...friendResults]);
    }, [searchTerm, friends, conversations]);

    // 4. Fetch Messages and mark as read
    useEffect(() => {
        const getMessages = async () => {
            if (!currentChat?._id || !token) return;
            try {
                const res = await axios.get(`/api/messages/${currentChat._id}`, {
                    headers: { 'x-auth-token': token }
                });
                setMessages(res.data);

                // Mark messages as read
                await axios.put(`/api/messages/read/${currentChat._id}`, {}, {
                    headers: { 'x-auth-token': token }
                });

                // Update local conversation to reset unread count
                setConversations(prev => prev.map(c => {
                    if (c._id === currentChat._id && c.unreadCount) {
                        return { ...c, unreadCount: { ...c.unreadCount, [user._id]: 0 } };
                    }
                    return c;
                }));
            } catch (err) {
                console.error('Error fetching messages:', err);
            }
        };
        getMessages();
    }, [currentChat, token, user?._id]);

    const handleSend = async (messageText) => {
        if (!messageText.trim() || !currentChat?._id || !user?._id) return;

        const messageData = {
            sender: user._id,
            text: messageText,
            conversationId: currentChat._id,
        };

        try {
            const res = await axios.post('/api/messages', messageData, {
                headers: { 'x-auth-token': token }
            });
            setMessages([...messages, res.data]);

            // Move current conversation to top of list
            setConversations(prev => {
                const updatedConv = prev.find(c => c._id === currentChat._id);
                if (updatedConv) {
                    const filtered = prev.filter(c => c._id !== currentChat._id);
                    return [{ ...updatedConv, lastMessage: { text: messageText, sender: user._id, timestamp: new Date() } }, ...filtered];
                }
                return prev;
            });
        } catch (err) {
            console.error('Error sending message:', err);
        }
    };

    // Double-click to delete message permanently
    const handleDeleteMessage = async (messageId, senderId) => {
        // Only allow deleting own messages
        if (senderId !== user?._id) return;

        try {
            await axios.delete(`/api/messages/${messageId}`, {
                headers: { 'x-auth-token': token }
            });
            // Remove message from state
            setMessages(prev => prev.filter(m => m._id !== messageId));
        } catch (err) {
            console.error('Error deleting message:', err);
        }
    };

    // Handle file attachment
    const handleFileAttachment = async (event) => {
        const file = event.target.files[0];
        if (!file || !currentChat?._id || !user?._id) return;

        // Convert file to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Data = reader.result;

            // Determine file type
            let fileType = 'document';
            if (file.type.startsWith('image/')) fileType = 'image';
            else if (file.type.startsWith('video/')) fileType = 'video';
            else if (file.type.startsWith('audio/')) fileType = 'audio';

            try {
                const res = await axios.post('/api/messages/file', {
                    conversationId: currentChat._id,
                    sender: user._id,
                    file: {
                        url: base64Data,
                        name: file.name,
                        type: fileType,
                        size: file.size
                    }
                }, {
                    headers: { 'x-auth-token': token }
                });

                setMessages([...messages, res.data]);

                // Move conversation to top
                setConversations(prev => {
                    const updatedConv = prev.find(c => c._id === currentChat._id);
                    if (updatedConv) {
                        const filtered = prev.filter(c => c._id !== currentChat._id);
                        return [{ ...updatedConv, lastMessage: { text: `📎 ${file.name}`, sender: user._id, timestamp: new Date() } }, ...filtered];
                    }
                    return prev;
                });
            } catch (err) {
                console.error('Error sending file:', err);
            }
        };
        reader.readAsDataURL(file);
        event.target.value = ''; // Reset input
    };

    const handleSelectUser = async (selectedItem) => {
        setSearchTerm("");
        setSearchResults([]);

        if (selectedItem.type === 'group') {
            setCurrentChat(selectedItem);
            return;
        }

        // Handle User Selection
        setLoadingChat(true);
        try {
            const existingConv = conversations.find(c =>
                !c.isGroup && c.members.some(id => String(id) === String(selectedItem._id))
            );

            if (existingConv) {
                setCurrentChat(existingConv);
            } else {
                const res = await axios.post('/api/conversations', {
                    senderId: user._id,
                    receiverId: selectedItem._id
                }, {
                    headers: { 'x-auth-token': token }
                });
                const newConv = res.data;
                setConversations(prev => {
                    if (prev.some(c => c._id === newConv._id)) return prev;
                    return [newConv, ...prev];
                });
                setCurrentChat(newConv);
            }
        } catch (err) {
            console.error("Error starting chat:", err);
        } finally {
            setLoadingChat(false);
        }
    };

    const handleCreateGroup = async (groupName, memberIds) => {
        try {
            const res = await axios.post('/api/conversations', {
                senderId: user._id,
                members: memberIds,
                isGroup: true,
                name: groupName
            }, {
                headers: { 'x-auth-token': token }
            });
            const newConv = res.data;
            setConversations(prev => [newConv, ...prev]);
            setCurrentChat(newConv);
            setOpenGroupModal(false);
        } catch (err) {
            console.error("Error creating group:", err);
        }
    };

    const handleUpdateGroup = async (updates) => {
        if (!currentChat?._id) return;
        try {
            const res = await axios.put(`/api/conversations/${currentChat._id}`, updates, {
                headers: { 'x-auth-token': token }
            });
            const updatedConv = res.data;
            setConversations(prev => prev.map(c => c._id === updatedConv._id ? updatedConv : c));
            setCurrentChat(updatedConv);
        } catch (err) {
            console.error("Error updating group:", err);
        }
    };

    const handleDeleteChat = async (conversationId, hardDelete = false) => {

        try {
            await axios.delete(`/api/conversations/${conversationId}${hardDelete ? '?hardDelete=true' : ''}`, {
                headers: { 'x-auth-token': token }
            });
            setConversations(prev => prev.filter(c => c._id !== conversationId));
            if (currentChat?._id === conversationId) setCurrentChat(null);
        } catch (err) {
            console.error("Error deleting chat:", err);
            alert("Failed to delete chat.");
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
                <CircularProgress color="inherit" />
            </Box>
        );
    }

    const getConversationData = (conversation) => {
        if (conversation.isGroup) {
            return {
                name: conversation.name || "Group Chat",
                avatar: conversation.groupImage || "https://cdn-icons-png.flaticon.com/512/166/166258.png",
                status: "available"
            };
        }
        const friendId = conversation.members.find(m => String(m) !== String(user._id));
        const friend = friends.find(f => String(f._id) === String(friendId));
        return {
            name: friend?.username || "User",
            avatar: friend?.profilePicture || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            status: "available"
        };
    };

    return (
        <div className="chat-window-wrapper">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileAttachment}
                style={{ display: 'none' }}
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
            />
            <MainContainer responsive>
                <Sidebar position="left" scrollable={false}>
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
                        <Typography
                            variant="h6"
                            sx={{ color: 'text.primary', fontWeight: 'bold', cursor: 'pointer' }}
                            onClick={() => navigate('/')}
                        >
                            {user?.username || 'Messages'}
                        </Typography>
                        <IconButton sx={{ color: 'text.primary' }} onClick={() => setOpenGroupModal(true)}><Add /></IconButton>
                    </Box>
                    <Search
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={v => setSearchTerm(v)}
                        onClearClick={() => setSearchTerm("")}
                    />

                    {/* Search Results */}
                    {searchTerm && searchResults.length > 0 && (
                        <div style={{ backgroundColor: 'black', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
                            {searchResults.map(result => (
                                <button
                                    key={result._id}
                                    onClick={() => handleSelectUser(result)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: 'none',
                                        backgroundColor: 'transparent',
                                        color: 'white',
                                        cursor: 'pointer',
                                        borderBottom: `1px solid #333`,
                                        textAlign: 'left'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <img
                                        src={result.type === 'group'
                                            ? (result.groupImage || "https://cdn-icons-png.flaticon.com/512/166/166258.png")
                                            : (result.profilePicture || "https://cdn-icons-png.flaticon.com/512/149/149071.png")
                                        }
                                        alt={result.username || result.name}
                                        style={{
                                            width: 42,
                                            height: 42,
                                            borderRadius: '50%',
                                            marginRight: 12,
                                            objectFit: 'cover'
                                        }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                                            {result.type === 'group' ? result.name : result.username}
                                        </div>
                                        <div style={{ color: '#aaa', fontSize: '0.85rem' }}>
                                            {result.type === 'group' ? 'Group Chat' : (result.name || "Click to start chat")}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {searchTerm && searchResults.length === 0 && (
                        <div style={{ padding: '16px', textAlign: 'center', color: '#888' }}>
                            No users found
                        </div>
                    )}

                    {/* Conversation List */}
                    {!searchTerm && (
                        <ConversationList>
                            {conversations.map(c => {
                                const { name, avatar } = getConversationData(c);
                                const unreadCount = c.unreadCount?.[user?._id] || 0;
                                const lastMessageText = c.lastMessage?.text || 'Click to chat';
                                const lastMessagePreview = lastMessageText.length > 25
                                    ? lastMessageText.substring(0, 25) + '...'
                                    : lastMessageText;

                                return (
                                    <div
                                        key={c._id}
                                        onDoubleClick={(e) => {
                                            e.stopPropagation();
                                            // Always perform "Clear Chat" (Soft Delete) on double click
                                            handleDeleteChat(c._id, false);
                                        }}
                                        style={{ cursor: 'pointer' }}
                                        title="Double-click to delete"
                                    >
                                        <Conversation
                                            name={name}
                                            info={lastMessagePreview}
                                            onClick={() => setCurrentChat(c)}
                                            active={currentChat?._id === c._id}
                                            unreadCnt={unreadCount > 0 ? unreadCount : undefined}
                                        >
                                            <Avatar src={avatar} status={unreadCount > 0 ? "available" : "dnd"} />
                                        </Conversation>
                                    </div>
                                );
                            })}
                            {conversations.length === 0 && (
                                <Box sx={{ p: 2, textAlign: 'center', color: '#888' }}>
                                    No conversations yet
                                </Box>
                            )}
                        </ConversationList>
                    )}
                </Sidebar>

                <ChatContainer>
                    {currentChat && (
                        (() => {
                            const { name, avatar } = getConversationData(currentChat);
                            return (
                                <ConversationHeader
                                    as="div"
                                    onClick={() => {
                                        if (currentChat.isGroup) {
                                            setOpenGroupDetails(true);
                                        } else if (name && name !== "User") {
                                            navigate(`/profile/${name}`);
                                        }
                                    }}
                                    style={{
                                        cursor: 'pointer',
                                        backgroundColor: theme.palette.background.default,
                                        color: theme.palette.text.primary,
                                        borderBottom: `1px solid ${theme.palette.divider}`
                                    }}
                                >
                                    <ConversationHeader.Back onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentChat(null);
                                    }} />
                                    <Avatar src={avatar} name={name} />
                                    <ConversationHeader.Content
                                        userName={name}
                                        info={currentChat.isGroup
                                            ? `${currentChat.members.length} members`
                                            : "Click to view profile"}
                                    />
                                    <ConversationHeader.Actions>
                                        <InfoButton onClick={(e) => {
                                            e.stopPropagation();
                                            if (currentChat.isGroup) {
                                                setOpenGroupDetails(true);
                                            } else if (name && name !== "User") navigate(`/profile/${name}`);
                                        }} />
                                    </ConversationHeader.Actions>
                                </ConversationHeader>
                            );
                        })()
                    )}

                    <MessageList typingIndicator={null}>
                        {currentChat ? (
                            (() => {
                                const { avatar } = getConversationData(currentChat);
                                return messages.map((m, i) => {
                                    const prevMessage = i > 0 ? messages[i - 1] : null;
                                    const showDateSeparator = isDifferentDay(prevMessage?.createdAt, m.createdAt);

                                    const isMe = m.sender === user?._id;
                                    let messageAvatar;
                                    if (isMe) {
                                        messageAvatar = user?.profilePicture || "/assets/person/noAvatar.png";
                                    } else if (currentChat.isGroup) {
                                        const sender = friends.find(f => f._id === m.sender);
                                        messageAvatar = sender?.profilePicture || "/assets/person/noAvatar.png";
                                    } else {
                                        messageAvatar = avatar || "/assets/person/noAvatar.png";
                                    }

                                    return (
                                        <React.Fragment key={i}>
                                            {showDateSeparator && (
                                                <MessageSeparator
                                                    content={formatDateSeparator(m.createdAt)}
                                                />
                                            )}
                                            <div
                                                onDoubleClick={() => handleDeleteMessage(m._id, m.sender)}
                                                style={{ cursor: isMe ? 'pointer' : 'default' }}
                                            >
                                                <Message
                                                    className={m.file?.url ? "cs-message--image-content" : ""}
                                                    model={{
                                                        message: m.file?.url ? '' : m.text,
                                                        sentTime: formatTime(m.createdAt),
                                                        sender: isMe ? "Me" : "Partner",
                                                        direction: isMe ? "outgoing" : "incoming",
                                                        position: "single"
                                                    }}
                                                >
                                                    <Avatar src={messageAvatar} name="User" />
                                                    {m.file?.url && (
                                                        <Message.CustomContent>
                                                            {m.file.type === 'image' ? (
                                                                <div
                                                                    onClick={() => setPreviewImage(m.file.url)}
                                                                    style={{ cursor: 'pointer' }}
                                                                >
                                                                    <img
                                                                        src={m.file.url}
                                                                        alt={m.file.name}
                                                                        style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', display: 'block' }}
                                                                    />
                                                                </div>
                                                            ) : m.file.type === 'video' ? (
                                                                <video
                                                                    src={m.file.url}
                                                                    controls
                                                                    style={{ maxWidth: '250px', borderRadius: '8px' }}
                                                                />
                                                            ) : (
                                                                <a
                                                                    href={m.file.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    download={m.file.name}
                                                                    style={{
                                                                        color: m.sender === user?._id ? 'white' : '#dae1e7',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '8px',
                                                                        padding: '8px',
                                                                        borderRadius: '8px',
                                                                        textDecoration: 'underline'
                                                                    }}
                                                                >
                                                                    📎 {m.file.name}
                                                                </a>
                                                            )}
                                                        </Message.CustomContent>
                                                    )}
                                                    <Message.Footer
                                                        sentTime={formatTime(m.createdAt)}
                                                    />
                                                </Message>
                                            </div>
                                        </React.Fragment>
                                    );
                                });
                            })()
                        ) : (
                            <MessageList.Content style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                height: "100%",
                                textAlign: "center",
                                color: "#888",
                                fontSize: "1.2em"
                            }}>
                                Select a conversation to start chatting
                            </MessageList.Content>
                        )}
                    </MessageList>

                    {currentChat && (
                        <MessageInput
                            placeholder="Message..."
                            onSend={handleSend}
                            onAttachClick={() => fileInputRef.current?.click()}
                            style={{
                                backgroundColor: theme.palette.background.default,
                                borderTop: `1px solid ${theme.palette.divider}`,
                            }}
                        />
                    )}
                </ChatContainer>
            </MainContainer>
            <CreateGroupModal
                open={openGroupModal}
                onClose={() => setOpenGroupModal(false)}
                friends={friends}
                onCreateGroup={handleCreateGroup}
            />

            {/* Image Preview Modal */}
            <Dialog
                open={!!previewImage}
                onClose={() => setPreviewImage(null)}
                maxWidth="xl"
                PaperProps={{
                    style: {
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        overflow: 'hidden'
                    }
                }}
            >
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <IconButton
                        onClick={() => setPreviewImage(null)}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            color: 'white',
                            zIndex: 10
                        }}
                    >
                        <Close />
                    </IconButton>
                    <img
                        src={previewImage}
                        alt="Preview"
                        style={{
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            borderRadius: '4px',
                            objectFit: 'contain'
                        }}
                    />
                </div>
            </Dialog>
            <GroupDetailsModal
                open={openGroupDetails}
                onClose={() => setOpenGroupDetails(false)}
                conversation={currentChat}
                allFriends={friends}
                onUpdateGroup={handleUpdateGroup}
                onDeleteChat={handleDeleteChat}
            />
        </div>
    );
}
