import axios from 'axios';
import { createContext, useEffect, useState } from 'react';

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [username, setLoggedInUsername] = useState(null);
    const [id, setId] = useState(null);

    useEffect(()=>{
        axios.get('/profile', {withCredentials:true}).then(response =>{
            console.log(response.data)
        })
    },[])

    return (
        <UserContext.Provider value={{ username, setLoggedInUsername, id, setId }}>
            {children}
        </UserContext.Provider>
    );
}
