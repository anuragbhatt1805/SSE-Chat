import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Lobby = () => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [joinRoomId, setJoinRoomId] = useState('');
  const [guestName, setGuestName] = useState('');

  const createRoom = async () => {
    if (!token) return alert('You must be logged in to create a room');
    try {
        // We need to pass the token implicitly via axios interceptor set in AuthContext
        const res = await axios.post('http://localhost:5000/api/chat/rooms');
        navigate(`/chat/${res.data.roomId}`);
    } catch (err) {
        console.error(err);
        alert('Failed to create room');
    }
  };

  const joinRoom = async (e) => {
    e.preventDefault();
    if (!joinRoomId) return;
    const nameToUse = user ? user.username : guestName;
    if (!nameToUse) return alert('Please enter a name');

    try {
        await axios.post('http://localhost:5000/api/chat/rooms/join', {
            roomId: joinRoomId,
            name: nameToUse
        });
        // We pass guest Name via state or param if not auth
        // If auth, backend knows us, but we still need our UI to know who we are.
        // Let's pass query param or state.
        navigate(`/chat/${joinRoomId}`, { state: { username: nameToUse } });
    } catch (err) {
        console.error(err);
        alert('Failed to join room');
    }
  };

  return (
    <div className="container">
      <div className="glass-panel" style={{ padding: '3rem', display: 'grid', gap: '3rem', gridTemplateColumns: '1fr 1fr', maxWidth: '800px' }}>

        {/* Create Room Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3>Create New Chat</h3>
          <p style={{ opacity: 0.7 }}>Start a new room and invite others.</p>
          <button onClick={createRoom} className="btn-primary" disabled={!token}>
            {token ? 'Create Chat' : 'Login to Create'}
          </button>
        </div>

        {/* Vertical Divider (visual only, CSS border) */}
        <div style={{ borderLeft: '1px solid var(--glass-border)', paddingLeft: '3rem' }}>
           <h3>Join Chat</h3>
           <p style={{ opacity: 0.7 }}>Enter a code to join an existing room.</p>
           <form onSubmit={joinRoom} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
             <input
                type="text"
                placeholder="Room Code"
                value={joinRoomId}
                onChange={e => setJoinRoomId(e.target.value)}
                required
             />
             {!user && (
                 <input
                    type="text"
                    placeholder="Your Name"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    required
                 />
             )}
             <button type="submit" className="btn-secondary">Join Room</button>
           </form>
        </div>

      </div>
    </div>
  );
};

export default Lobby;
