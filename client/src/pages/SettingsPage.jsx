import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function SettingsPage() {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const isDark = theme === 'dark';
    const bgPage = isDark ? 'bg-slate-950' : 'bg-lightGray';
    const bgCard = isDark ? 'bg-slate-900 border border-white/5' : 'bg-white border border-gray-200';
    const textPrimary = isDark ? 'text-white' : 'text-slate-900';
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';

    return (
        <div className={`p-10 ${bgPage} h-full overflow-y-auto transition-colors duration-300`}>
            <h1 className={`text-3xl font-display font-bold ${textPrimary} mb-8`}>Settings</h1>
            
            <div className={`${bgCard} p-8 rounded-2xl shadow-sm max-w-2xl transition-colors duration-300`}>
                <h2 className={`text-xl font-bold ${textPrimary} mb-6`}>Profile Information</h2>
                
                <div className="space-y-6">
                    <div>
                        <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Email Address</label>
                        <div className={`text-lg font-medium ${textPrimary}`}>{user?.email}</div>
                    </div>
                    
                    <div>
                        <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Role</label>
                        <div className={`text-lg font-medium ${textPrimary}`}>{user?.role || "User"}</div>
                    </div>
                </div>
            </div>

            <div className={`mt-8 ${bgCard} p-8 rounded-2xl shadow-sm max-w-2xl transition-colors duration-300`}>
                <h2 className={`text-xl font-bold ${textPrimary} mb-6`}>Appearance</h2>
                <div className="flex items-center justify-between">
                    <div>
                        <div className={`font-medium ${textPrimary} flex items-center gap-2`}>
                            {isDark ? <Moon size={18} /> : <Sun size={18} />}
                            {isDark ? 'Dark Mode' : 'Light Mode'}
                        </div>
                        <div className={`text-sm ${textSecondary}`}>
                            Switch between light and dark themes
                        </div>
                    </div>
                    <button 
                        onClick={toggleTheme}
                        className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${isDark ? 'bg-primary' : 'bg-gray-300'}`}
                    >
                        <div className={`w-6 h-6 bg-white rounded-full absolute top-1 shadow-sm transition-transform duration-300 ${isDark ? 'left-7' : 'left-1'}`}></div>
                    </button>
                </div>
            </div>
        </div>
    );
}
