// import { useState, useEffect } from 'react';
// import { supabase } from '../supabaseClient';
// import { FiLogIn, FiSun, FiMoon } from 'react-icons/fi';
// import logo from '../assets/popsik-logo.png'; // adjust path if needed

// function Login() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [darkMode, setDarkMode] = useState(false);

//   useEffect(() => {
//     document.documentElement.classList.toggle('dark', darkMode);
//   }, [darkMode]);

//   useEffect(() => {
//     const checkConnection = async () => {
//       const { data, error } = await supabase.from('Users').select('*').limit(1);
//       if (error) console.error('❌ Supabase connection failed:', error.message);
//       else console.log('✅ Supabase connected! Sample data:', data);
//     };
//     checkConnection();
//   }, []);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
//     if (signInError) {
//       setError(signInError.message);
//       setLoading(false);
//       return;
//     }

//     const userId = data.user.id;
//     const { data: profile, error: profileError } = await supabase
//       .from('Users')
//       .select('*')
//       .eq('id', userId)
//       .single();

//     if (profileError) {
//       setError('Login successful, but failed to fetch user profile.');
//       console.error('🔍 Profile fetch error:', profileError.message);
//     } else {
//       console.log('🎉 Logged in user profile:', profile);
//       window.location.href = '/dashboard';
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-neutral-900 px-4">
//       <div className="absolute top-4 right-4">
//         <button onClick={() => setDarkMode(!darkMode)} className="text-2xl text-gray-800 dark:text-white">
//           {darkMode ? <FiSun /> : <FiMoon />}
//         </button>
//       </div>
//       <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-md w-full max-w-md">
//         <div className="flex flex-col items-center mb-6">
//           <img src={logo} alt="Popsik Logo" className="w-40 mb-4" />
//         </div>

//         <h2 className="text-center text-lg font-semibold text-gray-700 dark:text-white mb-6">Login</h2>

//         <form onSubmit={handleLogin} className="space-y-4">
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             placeholder="Email"
//             required
//             className="w-full px-4 py-2 rounded border border-gray-300 dark:border-neutral-600 dark:bg-neutral-700 text-sm text-gray-700 dark:text-white"
//           />
//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             placeholder="Password"
//             required
//             className="w-full px-4 py-2 rounded border border-gray-300 dark:border-neutral-600 dark:bg-neutral-700 text-sm text-gray-700 dark:text-white"
//           />
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-[#b69d73] hover:bg-[#a88c65] text-white rounded"
//           >
//             <FiLogIn /> {loading ? 'Logging in...' : 'Login'}
//           </button>
//         </form>

//         {error && <p className="text-sm text-red-500 mt-4 text-center">{error}</p>}

//         <footer className="text-center text-xs text-gray-500 dark:text-neutral-400 mt-6">
//           © 2025 Popsik. All Rights Reserved.
//         </footer>
//       </div>
//     </div>
//   );
// }

// export default Login;
