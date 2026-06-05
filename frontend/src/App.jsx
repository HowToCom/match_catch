import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login';
import HomePage from './pages/Home';
import UploadPage from './pages/Upload';
import RegisterPage from './pages/Register';
import SearchResultPage from './pages/SearchResultPage';
import PostDetailPage from './pages/PostDetailPage';
import ChatListPage from './pages/ChatListPage';
import MatchManagementPage from './pages/MatchManagementPage';
import ReviewPage from './pages/ReviewPage';
import ProfileEditPage from './pages/ProfileEditPage';
import ProfilePage from './pages/ProfilePage';
import ChatDetailPage from './pages/ChatDetailPage';
import PostEditPage from './pages/PostEditPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/searchresult" element={<SearchResultPage />} />
        <Route path="/postdetail" element={<PostDetailPage />} />
        <Route path="/chatlist" element={<ChatListPage />} />
        <Route path="/matchmanagement" element={<MatchManagementPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/profileedit" element={<ProfileEditPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/chatdetail" element={<ChatDetailPage />} />
        <Route path="/postedit" element={<PostEditPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;