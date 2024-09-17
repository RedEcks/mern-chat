import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { UserContext } from './UserContext';

export default function RegisterAndLoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginOrRegister, setIsLoginOrRegister] = useState('register');
    const { setLoggedInUsername, setId } = useContext(UserContext);

    // Check if the user is already logged in when the component mounts
    useEffect(() => {
        async function checkLoginStatus() {
            try {
                const { data } = await axios.get('http://localhost:4000/profile', { withCredentials: true });
                if (data) {
                    setLoggedInUsername(data.username); // Assuming profile route returns username
                    setId(data.userId);  // Assuming profile route returns userId
                }
            } catch (error) {
                console.error('Error checking login status:', error);
            }
        }
        checkLoginStatus();
    }, [setLoggedInUsername, setId]);

    async function handleSubmit(ev) {
        ev.preventDefault();
        const url = isLoginOrRegister === 'register' ? 'register' : 'login';
        try {
            const { data } = await axios.post(`http://localhost:4000/${url}`, { username, password }, { withCredentials: true });
            setLoggedInUsername(username);
            setId(data.id);
        } catch (error) {
            console.error('Registration/Login failed:', error);
        }
    }

    return (
        <div className="bg-blue-50 h-screen flex items-center">
            <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
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
                    type="password" 
                    placeholder="password"
                    className="block w-full rounded-sm p-2 mb-2 border"
                />
                <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
                    {isLoginOrRegister === 'register' ? 'Register' : 'Login'}
                </button>
                <div className='text-center mt-2'>
                    {isLoginOrRegister === 'register' && (
                        <div>
                            Already a member? 
                            <button onClick={()=> setIsLoginOrRegister('login')}>
                                Login
                            </button>
                        </div>
                    )}
                    {isLoginOrRegister === 'login' && (
                        <div>
                            Don't have an account?
                            <button onClick={()=> setIsLoginOrRegister('register')}>
                                Register
                            </button>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}
