import React, { useState } from "react";
import axios from "axios";
import API_ENDPOINTS from "../../utils/constants";

const Register = () => {
  const [form, setForm] = useState({
    userId: "",
    password: "",
    confirmPassword: "",
    name: "",
    nickname: "",
    email: "",
    tel: "",
    agreedRequired: false,
    agreedOptional: false,
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_ENDPOINTS.AUTH}/register`, form);
      console.log("회원가입 성공:", response.data);
      setMessage("회원가입 성공!");
    } catch (error) {
      console.error("회원가입 실패:", error.response?.data || error);
      setMessage(error.response?.data?.message || "회원가입 실패!");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <input name="userId" placeholder="아이디" onChange={handleChange} required /><br />
        <input name="password" type="password" placeholder="비밀번호" onChange={handleChange} required /><br />
        <input name="confirmPassword" type="password" placeholder="비밀번호 확인" onChange={handleChange} required /><br />
        <input name="name" placeholder="이름" onChange={handleChange} required /><br />
        <input name="nickname" placeholder="닉네임" onChange={handleChange} required /><br />
        <input name="email" type="email" placeholder="이메일" onChange={handleChange} required /><br />
        <input name="tel" placeholder="전화번호 (000-0000-0000)" onChange={handleChange} required /><br />
        <label>
          <input type="checkbox" name="agreedRequired" onChange={handleChange} />
          필수 약관 동의
        </label><br />
        <label>
          <input type="checkbox" name="agreedOptional" onChange={handleChange} />
          선택 약관 동의
        </label><br />
        <button type="submit">가입하기</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default Register;
