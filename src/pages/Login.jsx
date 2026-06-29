import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import "./Login.css";

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Login Successful!");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Rudraksha Textiles</h1>
        <h2>Welcome Back</h2>
        <p>Please login to continue</p>

        <form onSubmit={handleSubmit}>
          <div className="input-box">
            <input type="email" placeholder="Email Address" required />
          </div>

          <div className="input-box">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
            />
            <span
              className="show-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;