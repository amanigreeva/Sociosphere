async function registerUser() {
    try {
        const userData = {
            username: "backend_test_user",
            email: "backend_test@example.com",
            password: "password123",
            name: "Backend Test User"
        };

        console.log('Registering user:', userData.username);
        const res = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        console.log('Registration Status:', res.status);
        if (res.ok) {
            const data = await res.json();
            console.log('User registered:', data);
        } else {
            console.log('Registration failed:', await res.text());
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

registerUser();
