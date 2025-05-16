// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import LoginPage from './pages/LoginPage';
// import Dashboard from './pages/Dashboard';
// import ApplicantsPage from './pages/ApplicantsPage';
// import InterviewsPage from './pages/InterviewsPage'; // ✅ new
// import ProtectedRoute from './components/ProtectedRoute';
// import MainLayout from './layouts/MainLayout';
// import OnboardingPage from './pages/OnboardingPage'; // ✅ new
// import { useEffect } from 'react';
// import { supabase } from './supabaseClient'; // Adjust the path as necessary

// export default function App() {
//   useEffect(() => {
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((event, session) => {
//       if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
//         localStorage.setItem('supabase.auth.token', JSON.stringify(session));
//       } else if (event === 'SIGNED_OUT') {
//         localStorage.removeItem('supabase.auth.token');
//       }
//     });
  
//     return () => subscription.unsubscribe();
//   }, []);

//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<LoginPage />} />
//         <Route
//           path="/dashboard"
//           element={
//             <ProtectedRoute>
//               <MainLayout>
//                 <Dashboard />
//               </MainLayout>
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/applicants"
//           element={
//             <ProtectedRoute>
//               <MainLayout>
//                 <ApplicantsPage />
//               </MainLayout>
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/interviews"
//           element={
//             <ProtectedRoute>
//               <MainLayout>
//                 <InterviewsPage />
//               </MainLayout>
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/onboarding"
//           element={
//             <ProtectedRoute>
//               <MainLayout>
//                 <OnboardingPage />
//               </MainLayout>
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </BrowserRouter>
//   );
// }

import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ApplicantsPage from './pages/ApplicantsPage';
import InterviewsPage from './pages/InterviewsPage';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import OnboardingPage from './pages/OnboardingPage';
import { useEffect } from 'react';
import { supabase } from './supabaseClient';

function AppWrapper() {
  const navigate = useNavigate();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        localStorage.setItem('supabase.auth.token', JSON.stringify(session));
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        localStorage.removeItem('supabase.auth.token');
        navigate('/'); // Redirect to login
      }
    });

    // On initial load, check session
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/'); // Redirect if no session found
      }
    };

    checkSession();

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/applicants"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ApplicantsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/interviews"
        element={
          <ProtectedRoute>
            <MainLayout>
              <InterviewsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <MainLayout>
              <OnboardingPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}
