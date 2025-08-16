'use client';
import { useState } from 'react';

export default function LoginPage() {

    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');

    async function handleSubmit(e: React.FormEvent){
        e.preventDefault();

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include cookies for session management
            body: JSON.stringify({ usernameOrEmail, password })
        });

        if (!res.ok) {
            const errorData = await res.json();
            console.error('Login failed:', errorData);
            alert('Login failed: ' + errorData.message);
        } else {
            const data = await res.json();
            console.log('Login successful:', data);
            alert('Login successful!');
            window.location.href = '/cameras';
        }
    };

    return (
        <div>
            <h1>Login Page</h1>
            <form onSubmit={handleSubmit}>
                <input value={usernameOrEmail} onChange={(e)=>setUsernameOrEmail(e.target.value)} type="text" name="usernameOrEmail" placeholder="Username or Email" className='p-1 border border-box' required/>
                <br />
                <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" name="password" placeholder="Password" className='p-1 border border-box' required/>
                <br />
                <button type="submit" className='p-1 border border-box'>Submit</button>
            </form>
        </div>
    )
};