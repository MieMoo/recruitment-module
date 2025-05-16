import { NavLink, useNavigate } from 'react-router-dom';
import { FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import LogoutModal from '../components/LogoutModal'; // Import modal

export default function Navbar() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    return localStorage.theme === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const navStyle = ({ isActive }) =>
    isActive
      ? 'text-[#a68c65] font-semibold'
      : 'text-[#a68c65] hover:text-[#7a6a50]';

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout failed:', error.message);
      alert('Logout failed. Please try again.');
    } else {
      console.log('Logged out successfully!');
      navigate('/');
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-[#171717] border-b border-gray-200 dark:border-gray-700 shadow-sm z-50 h-16">
        <div className="flex items-center justify-between px-6 h-full relative">
          <div className="text-2xl font-extrabold text-[#a68c65] tracking-wide">POPSIK</div>
          <ul className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex space-x-10 text-lg font-medium">
            <li><NavLink to="/dashboard" className={navStyle}>Dashboard</NavLink></li>
            <li><NavLink to="/applicants" className={navStyle}>Applicants</NavLink></li>
            <li><NavLink to="/interviews" className={navStyle}>Interviews</NavLink></li>
            <li><NavLink to="/onboarding" className={navStyle}>Onboarding</NavLink></li>
          </ul>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDark(!isDark)}
              className="text-[#4b4b4b] dark:text-white hover:text-[#a68c65] transition-colors"
              title="Toggle Theme"
            >
              {isDark ? <FiSun className="w-6 h-6" /> : <FiMoon className="w-6 h-6" />}
            </button>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="text-[#4b4b4b] dark:text-white hover:text-red-600 transition-colors"
              title="Logout"
            >
              <FiLogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

{showLogoutConfirm && (
  <LogoutModal
    onConfirm={handleLogout}
    onCancel={() => setShowLogoutConfirm(false)}
    isDark={isDark} // ✅ Pass dark mode state
  />
)}
    </>
  );
}
