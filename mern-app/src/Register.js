import React, { useContext, useState } from 'react';
import axios from 'axios';
import { UserContext } from './UserContext';

export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { setLoggedInUsername, setId } = useContext(UserContext);

    async function register(ev) {
        ev.preventDefault();

        try {
            const { data } = await axios.post('http://localhost:4000/register', { username, password }, { withCredentials: true });
            setLoggedInUsername(username);
            setId(data.id);
        } catch (error) {
            console.error('Registration failed:', error);
        }
    }

    return (
        <div className="bg-blue-50 h-screen flex items-center">
            <form className="w-64 mx-auto mb-12" onSubmit={register}>
                <input
                    value={username}
                    onChange={ev => setUsername(ev.target.value)}
                    type="text"
                    placeholder="username"
                    className="block w-full rounded-sm p-2 mb-2 border"
                />
                <input
                    value={password}
                    onChange={ev => setPassword(ev.target.value)}
                    type="password" // Use type="password" for password fields
                    placeholder="password"
                    className="block w-full rounded-sm p-2 mb-2 border"
                />
                <button className="bg-blue-500 text-white block w-full rounded-sm p-2">Register</button>
            </form>
        </div>
    );
}
