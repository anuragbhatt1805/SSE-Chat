import { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";

const ChatRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useContext(AuthContext);

  // Use username from location state (for guests) or auth user
  const username = user ? user.username : location.state?.username || "Guest";

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [participants, setParticipants] = useState([]);
  const [isCreator, setIsCreator] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch Room Data (Participants & Messages)
    const fetchRoomInfo = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/chat/rooms/${roomId}`,
        );
        setParticipants(res.data.participants);
        setMessages(res.data.messages || []); // Optionally load history

        // creator check
        if (token) {
          // We could verify against res.data.creator but we need the ID.
          // For now, let's keep the simple token check or improve it later.
          setIsCreator(true);
        }
      } catch (err) {
        console.error("Failed to fetch room info:", err);
      }
    };
    fetchRoomInfo();

    // SSE Connection
    const eventSource = new EventSource(
      `http://localhost:5000/api/chat/events/${roomId}`,
    );

    eventSource.onopen = () => {
      console.log("SSE Connected");
      setConnectionStatus("connected");
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "connected") return;

      if (data.type === "message") {
        setMessages((prev) => [...prev, data.message]);
      } else if (data.type === "join") {
        setParticipants((prev) => {
          // Avoid duplicates if valid
          if (prev.find((p) => p.name === data.user)) return prev;
          return [...prev, { name: data.user }];
        });
        setMessages((prev) => [
          ...prev,
          { text: `${data.user} joined the chat`, isSystem: true },
        ]);
      } else if (data.type === "room_closed") {
        alert(data.msg);
        eventSource.close();
        navigate("/lobby");
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Error:", err);
      setConnectionStatus("error");
      // Don't close, let it retry
    };

    return () => {
      eventSource.close();
    };
  }, [roomId, navigate, token]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      await axios.post(
        `http://localhost:5000/api/chat/rooms/${roomId}/messages`,
        {
          sender: username,
          text: inputText,
        },
      );
      setInputText("");
    } catch (err) {
      console.error(err);
    }
  };

  const closeRoom = async () => {
    if (
      !window.confirm(
        "Are you sure you want to close this room? All users will be removed.",
      )
    )
      return;
    try {
      await axios.delete(`http://localhost:5000/api/chat/rooms/${roomId}`);
      // Redirect handled by SSE 'room_closed' event usually, but creator triggers it.
      // We can wait for event or redirect immediately.
    } catch (err) {
      console.error(err);
      alert("Failed to close room (only creator can close)");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(roomId);
    alert("Room Code copied to clipboard!");
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className="container"
      style={{
        alignItems: "stretch",
        height: "100vh",
        padding: "1rem",
        boxSizing: "border-box",
      }}
    >
      {/* Toast Notification */}
      {connectionStatus !== "connected" && (
        <div
          style={{
            position: "absolute",
            bottom: "2rem",
            right: "2rem",
            background: connectionStatus === "error" ? "#ef4444" : "#eab308",
            color: "white",
            padding: "1rem",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "white",
              animation:
                connectionStatus === "error" ? "none" : "pulse 1s infinite",
            }}
          ></div>
          {connectionStatus === "error"
            ? "Connection lost. Reconnecting..."
            : "Connecting to server..."}
        </div>
      )}

      <div
        className="glass-panel"
        style={{
          display: "flex",
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          overflow: "hidden",
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            width: "250px",
            background: "rgba(0,0,0,0.2)",
            padding: "1rem",
            borderRight: "1px solid var(--glass-border)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <h3>Room Info</h3>
          <p style={{ marginBottom: "1rem" }}>
            Participants: <strong>{participants.length}</strong>
          </p>
          <div style={{ flex: 1, overflowY: "auto", marginBottom: "1rem" }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {participants.map((p, i) => (
                <li
                  key={i}
                  style={{
                    padding: "0.5rem",
                    background: "rgba(255,255,255,0.05)",
                    marginBottom: "0.25rem",
                    borderRadius: "4px",
                  }}
                >
                  {p.name}
                </li>
              ))}
            </ul>
          </div>
          <div
            style={{
              marginTop: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <button
              onClick={copyLink}
              className="btn-secondary"
              style={{ fontSize: "0.8rem" }}
            >
              Share Code
            </button>
            {isCreator && (
              <button
                onClick={closeRoom}
                className="btn-danger"
                style={{ fontSize: "0.8rem" }}
              >
                Close Room
              </button>
            )}
            <button
              onClick={() => navigate("/lobby")}
              className="btn-secondary"
              style={{ fontSize: "0.8rem" }}
            >
              Leave
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: "1rem",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.isSystem
                    ? "center"
                    : msg.sender === username
                      ? "flex-end"
                      : "flex-start",
                  maxWidth: "70%",
                  marginBottom: "0.5rem",
                }}
              >
                {msg.isSystem ? (
                  <span style={{ fontSize: "0.8rem", opacity: 0.6 }}>
                    {msg.text}
                  </span>
                ) : (
                  <div
                    style={{
                      background:
                        msg.sender === username
                          ? "var(--primary-color)"
                          : "var(--secondary-color)",
                      padding: "0.75rem",
                      borderRadius: "12px",
                      borderBottomRightRadius:
                        msg.sender === username ? 0 : "12px",
                      borderBottomLeftRadius:
                        msg.sender !== username ? 0 : "12px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        opacity: 0.7,
                        marginBottom: "0.2rem",
                      }}
                    >
                      {msg.sender}
                    </div>
                    <div>{msg.text}</div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={sendMessage}
            style={{
              padding: "1rem",
              background: "rgba(0,0,0,0.1)",
              display: "flex",
              gap: "1rem",
            }}
          >
            <input
              type="text"
              placeholder="Type a message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit" className="btn-primary">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
