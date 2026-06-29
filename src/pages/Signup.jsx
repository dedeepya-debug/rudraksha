import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
  e.preventDefault();

  alert("Account Created Successfully!");

  navigate("/");
};

  return (
    <div className="signup-container">
      <div className="signup-card">

        <h1>Rudraksha Textiles</h1>

        <h2>Create Account</h2>

        <p>Join us today</p>

        <form onSubmit={handleSubmit}>

          <div className="input-box">
            <input
              type="text"
              placeholder="Full Name"
              required
            />
          </div>

          <div className="input-box">
            <input
              type="email"
              placeholder="Email Address"
              required
            />
          </div>

          <div className="input-box">
            <input
              type="tel"
              placeholder="Phone Number"
              required
            />
          </div>

          <div className="input-box">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create Password"
              required
            />

            <span
              className="show-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          <button className="signup-btn">
            Create Account
          </button>

        </form>

        <p className="login-text">
          Already have an account?
          <a href="/login"> Login</a>
        </p>

      </div>
    </div>
  );
}

export default Signup;