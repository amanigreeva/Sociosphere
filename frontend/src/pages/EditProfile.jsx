import React, { useContext, useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import './home.css';
import { AuthContext } from '../context/AuthContext';
import { makeRequest } from '../axios';
import { toast } from 'react-toastify';

export default function EditProfile() {
    const { user, dispatch } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        username: user.username,
        fullName: user.fullName || "",
        bio: user.bio || "",
        city: user.city || "",
        from: user.from || "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.placeholder.toLowerCase().replace(" ", "")]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await makeRequest.put("/users/" + user._id, {
                userId: user._id,
                ...formData
            });
            dispatch({ type: "UPDATE_USER", payload: res.data });
            toast.success("Profile updated successfully!");
        } catch (err) {
            console.log(err);
            toast.error("Failed to update profile");
        }
    };

    return (
        <>
            <Navbar />
            <div className="homeContainer">
                <Sidebar />
                <div className="feed">
                    <div className="feedWrapper">
                        <h2>Edit Profile</h2>
                        <form className="editProfileForm" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <input placeholder="Username" className="loginInput" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                            <input placeholder="Full Name" className="loginInput" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
                            <input placeholder="Bio" className="loginInput" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
                            <input placeholder="City" className="loginInput" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                            <input placeholder="From" className="loginInput" value={formData.from} onChange={(e) => setFormData({ ...formData, from: e.target.value })} />
                            <button className="loginButton" style={{ width: '150px' }}>Update</button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
