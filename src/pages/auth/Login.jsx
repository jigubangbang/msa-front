import React, { useState } from "react";
import axios from "axios";
import API_ENDPOINTS from "../../utils/constants";

const Login = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_ENDPOINTS.AUTH}/login`, {
        userId,
        password,
      });
      console.log("로그인 성공:", response.data);
      setMessage("로그인 성공!");
      localStorage.setItem("accessToken", response.data.accessToken);
    } catch (error) {
      console.error("로그인 실패:", error);
      setMessage("로그인 실패!");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>로그인</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>ID: </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </div>
        <div>
          <label>비밀번호: </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">로그인</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default Login;
