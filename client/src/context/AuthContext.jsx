import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // Verify token / fetch user profile
            fetch('http://localhost:8080/user/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => {
                if (res.ok) return res.json();
                throw new Error("Invalid token");
            })
            .then(userData => {
                setUser(userData);
                setLoading(false);
            })
            .catch(() => {
                logout();
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (email, password) => {
        const response = await fetch('http://localhost:8080/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) throw new Error("Login failed");
        
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setToken(data.token);
        return true;
    };

    const register = async (email, password) => {
        const response = await fetch('http://localhost:8080/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) throw new Error("Registration failed");
        
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setToken(data.token);
        return true;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
