import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import LostItems from './pages/LostItems';
import FoundItems from './pages/FoundItems';
import PostItem from './pages/PostItem';
import ItemDetails from './pages/ItemDetails';
import Profile from './pages/Profile';
import EditItem from './pages/EditItem';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Router>
        <div className="min-h-screen bg-white flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/lost" element={<LostItems />} />
              <Route path="/found" element={<FoundItems />} />
              <Route path="/items/:id" element={<ItemDetails />} />
              <Route path="/profile/:id" element={<Profile />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/post" element={<PostItem />} />
                <Route path="/edit/:id" element={<EditItem />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Routes>
          </main>
          <footer className="py-8 bg-white border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
              &copy; {new Date().getFullYear()} Campus Lost & Found. All rights reserved.
            </div>
          </footer>
        </div>
      </Router>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
