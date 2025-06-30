// src/pages/auth/FindPassword.jsx
import React from 'react';
import FindContainer from '../../components/auth/FindContainer';

export default function FindPassword() {
  return (
    <FindContainer>
      <h2>비밀번호 찾기</h2>
      <form>
        <input type="text" placeholder="이름" />
        <input type="text" placeholder="아이디" />
        <input type="email" placeholder="이메일" />
        <button type="submit">확인</button>
      </form>
    </FindContainer>
  );
}
