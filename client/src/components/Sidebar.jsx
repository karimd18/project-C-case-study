import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { PanelLeftClose, PanelLeftOpen, LogOut, Settings, Plus, MessageSquare } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [history, setHistory] = useState([]);

  const handleHistorySelect = (item) => {
    navigate(`/chat/${item.id}`);
  };

  const handleNewChat = () => {
    navigate('/chat');
  };
  
  useEffect(() => {
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    try {
      if(!user) return;
      
      const token = localStorage.getItem('token');
      // Fetch Chats instead of History
      const res = await fetch(`http://localhost:8080/api/chats?userId=${user.email}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Sort by updatedAt descending
        setHistory(data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
      }
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-slate-950 border-r border-white/5' : 'bg-lightGray border-r border-gray-200';
  const textColor = isDark ? 'text-gray-300' : 'text-gray-600';
  const hoverColor = isDark ? 'hover:bg-white/5' : 'hover:bg-gray-200';
  const activeColor = isDark ? 'text-white' : 'text-slate-900';
  const buttonBg = isDark ? 'bg-white/5' : 'bg-white shadow-sm border border-gray-100';

  return (
    <div className={`${collapsed ? 'w-20' : 'w-72'} ${bgColor} h-full flex flex-col transition-all duration-300 relative shrink-0 z-20`}>
      
      {/* Header / New Chat */}
      <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            {!collapsed && (
                <div className={`font-display font-bold text-xl ${activeColor} tracking-tight`}>
                    Project C
                </div>
            )}
            <button 
                onClick={() => setCollapsed(!collapsed)}
                className={`p-2 rounded-lg ${hoverColor} ${textColor} transition-colors`}
            >
                {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </button>
          </div>

          <button
            onClick={handleNewChat}
            className={`w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white py-3 rounded-xl transition-all shadow-lg active:scale-95 font-medium ${collapsed ? 'px-0' : 'px-4'}`}
            title="New Chat"
          >
             <Plus size={20} />
             {!collapsed && <span>New Chat</span>}
          </button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2">
        {!collapsed && <div className={`text-xs font-semibold ${textColor} uppercase tracking-wider mb-3 px-2`}>Recent Chats</div>}
        <ul className="space-y-1">
            {history.map((item) => (
              <li key={item.id}>
                <button 
                  onClick={() => handleHistorySelect(item)}
                  title={item.title}
                  className={`w-full text-left px-3 py-3 rounded-xl ${hoverColor} group transition-all flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}
                >
                   <MessageSquare size={18} className={textColor} />
                   {!collapsed && (
                       <span className={`truncate text-sm font-medium ${activeColor} group-hover:text-primary transition-colors`}>
                           {item.title}
                       </span>
                   )}
                </button>
              </li>
            ))}
        </ul>
      </div>

      {/* Footer / User Profile */}
      <div className={`p-4 border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-light pt-0.5 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {user?.email?.[0].toUpperCase()}
            </div>
            {!collapsed && (
                <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${activeColor} truncate`}>{user?.email}</div>
                    <div className={`text-xs ${textColor}`}>Pro Plan</div>
                </div>
            )}
        </div>
        
        <div className="mt-4 flex gap-2">
             <button 
                onClick={() => navigate('/settings')}
                className={`flex-1 p-2 rounded-lg ${buttonBg} ${hoverColor} ${textColor} hover:text-primary transition-colors flex items-center justify-center gap-2`} 
                title="Settings"
             >
                <Settings size={18} />
                {!collapsed && <span className="text-xs font-medium">Settings</span>}
             </button>
             <button 
                onClick={logout}
                className={`flex-1 p-2 rounded-lg ${buttonBg} ${hoverColor} text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2`}
                title="Log Out"
             >
                <LogOut size={18} />
                {!collapsed && <span className="text-xs font-medium">Log out</span>}
             </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
