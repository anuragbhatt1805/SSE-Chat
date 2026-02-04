import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Auth from './pages/Auth';
import Lobby from './pages/Lobby';
import ChatRoom from './pages/ChatRoom';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/chat/:roomId" element={<ChatRoom />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
