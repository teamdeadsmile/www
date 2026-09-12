import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './app/AppLayout';
import { ProtectedRoute } from './app/ProtectedRoute';
import { Home } from './pages/Home';
import { Games } from './pages/Games';
import { GameDetails } from './pages/GameDetails';
import { Search } from './pages/Search';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Account } from './pages/Account';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Studio } from './pages/Studio';
import { News } from './pages/News';
import { Wishlist } from './pages/Wishlist';
import { Videos } from './pages/Videos';
import { Downloads } from './pages/Downloads';
import { Store } from './pages/Store';
import { Support } from './pages/Support';
import { PressKit } from './pages/PressKit';
import { NotFound } from './pages/NotFound';
import { Status } from './pages/Status'
import { PublicProfile } from './pages/PublicProfile';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';

export default function App() {
  return <Routes><Route element={<AppLayout />}>
    <Route path="/" element={<Home />} />
    <Route path="/privacy" element={<Privacy />} />
    <Route path="/terms" element={<Terms />} />
    <Route path="/presskit" element={<PressKit />} />
    <Route path="/games" element={<Games />} />
    <Route path="/games/:slug" element={<GameDetails />} />
    <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
    <Route path="/news" element={<News />} />
    <Route path="/news/:slug" element={<News />} />
    <Route path="/videos" element={<Videos />} />
    <Route path="/videos/:id" element={<Videos />} />
    <Route path="/downloads" element={<Downloads />} />
    {/* <Route path="/store" element={<Store />} /> */}
    <Route path="/support" element={<Support />} />
    <Route path="/studio" element={<Studio />} />
    <Route path="/search" element={<Search />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/status" element={<Status />} />
    <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
    <Route path="/profile/:username" element={<PublicProfile />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="*" element={<NotFound />} />
  </Route></Routes>;
}
