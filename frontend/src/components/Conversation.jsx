import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './conversation.css';

export default function Conversation({ conversation, currentUser }) {
    const [user, setUser] = useState(null);
    const { token } = useAuth();

    useEffect(() => {
        // Robust ID comparison
        const friendId = conversation.members.find((m) => String(m) !== String(currentUser._id));

        if (!friendId) return;

        const getUser = async () => {
            try {
                const res = await axios.get("/api/users/" + friendId, {
                    headers: { 'x-auth-token': token }
                });
                setUser(res.data);
            } catch (err) {
                console.log("Error fetching conversation user:", err);
            }
        };
        getUser();
    }, [currentUser, conversation, token]);

    return (
        <div className="conversation">
            <img
                className="conversationImg"
                src={user?.profilePicture || user?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                alt=""
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="conversationName">{user?.username}</span>
                {user?.name && user.name !== user.username && (
                    <span className="conversationSub">{user.name}</span>
                )}
            </div>
        </div>
    );
}
