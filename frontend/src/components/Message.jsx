import React from 'react';
import './message.css';
import { format } from 'timeago.js';

export default function Message({ message, own, senderPhoto, ownPhoto, senderName, ownName }) {
    return (
        <div className={own ? "message own" : "message"}>
            <div className="messageTop">
                {!own && (
                    <img
                        className="messageImg"
                        src={senderPhoto || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                        alt=""
                    />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: own ? 'flex-end' : 'flex-start' }}>
                    <p className="messageText">{message.text}</p>
                </div>
            </div>
            <div className="messageBottom">{format(message.createdAt)}</div>
        </div>
    );
}
