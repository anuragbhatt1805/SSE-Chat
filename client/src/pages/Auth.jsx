import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await signup(username, password);
      }
      navigate("/lobby");
    } catch (err) {
      alert("Authentication failed");
      console.error(err);
    }
  };

  return (
    <div className="container">
      <div
        className="glass-panel"
        style={{ padding: "2rem", width: "100%", maxWidth: "400px" }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary animate-fade-in">
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>
        <p style={{ marginTop: "1.5rem", textAlign: "center", opacity: 0.8 }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span
            style={{
              color: "var(--accent-color)",
              cursor: "pointer",
              fontWeight: "bold",
            }}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Auth;
