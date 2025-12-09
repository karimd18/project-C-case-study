import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/chat');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-8 rounded-2xl shadow-2xl">
                <h2 className="text-3xl font-bold text-white mb-6 text-center bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Welcome Back</h2>
                
                {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-sm font-medium mb-1">Email</label>
                        <input 
                            type="email" 
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-sm font-medium mb-1">Password</label>
                        <input 
                            type="password" 
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-500/20">
                        Sign In
                    </button>
                </form>

                <div className="mt-6 text-center text-slate-400 text-sm">
                    Don't have an account? <Link to="/register" className="text-blue-400 hover:text-blue-300">Sign up</Link>
                </div>
            </div>
        </div>
    );
}
