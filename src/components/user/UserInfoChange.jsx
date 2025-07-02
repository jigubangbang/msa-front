import React, { useState, useEffect } from "react";
import api from "../../apis/api";
import API_ENDPOINTS from "../../utils/constants";
import styles from "./UserInfoChange.module.css";
import IdIcon from "../../assets/auth/id.svg";
import NameIcon from "../../assets/auth/name.svg";
import NicknameIcon from "../../assets/auth/nickname.svg";
import TelIcon from "../../assets/auth/tel.svg";
import EmailIcon from "../../assets/auth/email.svg";
import { useMemo } from "react";
import debounce from "lodash.debounce";
import { Circles } from "react-loader-spinner";

export default function UserInfoChange({ userInfo, onUpdate }) {
  const [form, setForm] = useState({
    name: "",
    nickname: "",
    tel: "",
    email: "",
  });

  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState("idle");
  const [emailCodeStatus, setEmailCodeStatus] = useState("idle");
  const [emailTimer, setEmailTimer] = useState(0);
  const [emailInterval, setEmailInterval] = useState(null);

  useEffect(() => {
    if (userInfo) {
      setForm({
        name: userInfo.name || "",
        nickname: userInfo.nickname || "",
        tel: userInfo.tel || "",
        email: userInfo.email || "",
      });
      setNewEmail(userInfo.email || "");
    }
  }, [userInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const cleanedValue = value.replace(/\s/g, "");

    setForm((prev) => ({ ...prev, [name]: cleanedValue }));
    setMessage("");

    // 유효성 검사
    if (name === "name") {
      if (cleanedValue === "") {
        setErrors((prev) => ({ ...prev, name: "" }));
        return;
      }
      const namePattern = /^[가-힣]{2,6}$/;
      if (!namePattern.test(cleanedValue)) {
        setErrors((prev) => ({
          ...prev,
          name: "이름은 2~6자의 한글만 입력 가능합니다",
        }));
      } else {
        setErrors((prev) => ({ ...prev, name: "" }));
      }
    }

    if (name === "nickname") {
      if (cleanedValue === "") {
        setErrors((prev) => ({ ...prev, nickname: "" }));
        return;
      }
      const nicknamePattern = /^[가-힣a-zA-Z0-9]{1,10}$/;
      if (!nicknamePattern.test(cleanedValue)) {
        setErrors((prev) => ({
          ...prev,
          nickname: "닉네임은 1~10자의 한글, 영문, 숫자만 입력 가능합니다",
        }));
      } else {
        setErrors((prev) => ({ ...prev, nickname: "" }));
      }
    }

    if (name === "tel") {
      if (cleanedValue === "") {
        setForm((prev) => ({ ...prev, tel: "" }));
        setErrors((prev) => ({ ...prev, tel: "" }));
        return;
      }

      const onlyDigits = value.replace(/\D/g, "");
      let formatted = onlyDigits;
      if (onlyDigits.length <= 3) {
        formatted = onlyDigits;
      } else if (onlyDigits.length <= 7) {
        formatted = `${onlyDigits.slice(0, 3)}-${onlyDigits.slice(3)}`;
      } else {
        formatted = `${onlyDigits.slice(0, 3)}-${onlyDigits.slice(
          3,
          7
        )}-${onlyDigits.slice(7, 11)}`;
      }

      setForm((prev) => ({ ...prev, [name]: formatted }));

      const telPattern = /^\d{3}-\d{3,4}-\d{4}$/;
      if (!telPattern.test(formatted)) {
        setErrors((prev) => ({
          ...prev,
          tel: "올바른 전화번호 형식으로 입력해 주세요",
        }));
      } else {
        setErrors((prev) => ({ ...prev, tel: "" }));
      }
    }
  };

  // 기본 정보 수정 (이름, 닉네임, 전화번호)
  const handleBasicInfoSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    // 기존 값이 있던 필드 -> 빈값 변경 방지
    if (userInfo?.name && !form.name.trim()) {
      setMessage("이름을 입력해 주세요.");
      setMessageType("error");
      return;
    }

    if (userInfo?.nickname && !form.nickname.trim()) {
      setMessage("닉네임을 입력해 주세요.");
      setMessageType("error");
      return;
    }

    if (userInfo?.tel && !form.tel.trim()) {
      setMessage("전화번호를 입력해 주세요.");
      setMessageType("error");
      return;
    }

    if (userInfo?.email && !newEmail.trim()) {
      setMessage("이메일을 입력해 주세요.");
      setMessageType("error");
      return;
    }

    // 유효성 검사
    const hasError = Object.values(errors).some((err) => err);
    if (hasError) {
      setMessage("조건에 맞게 입력해 주세요");
      setMessageType("error");
      return;
    }

    // 변경사항 체크
    const hasBasicChanges =
      form.name !== userInfo?.name ||
      form.nickname !== userInfo?.nickname ||
      form.tel !== userInfo?.tel;

    const hasEmailChanges = emailCodeStatus === "verified";

    if (!hasBasicChanges && !hasEmailChanges) {
      alert("변경된 정보가 없습니다.");
      return;
    }

    setIsLoading(true);

    if (emailCodeStatus === "verified") {
      try {
        const token = localStorage.getItem("accessToken");
        await api.put(
          `${API_ENDPOINTS.USER}/email/change-confirm`,
          {
            email: newEmail,
            emailCode: emailCode,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (err) {
        setMessage("이메일 변경에 실패했습니다");
        setMessageType("error");
        return;
      }
    }

    try {
      const token = localStorage.getItem("accessToken");
      await api.put(
        `${API_ENDPOINTS.USER}/me`,
        {
          name: form.name,
          nickname: form.nickname,
          tel: form.tel,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("회원 정보가 수정되었습니다!");

      if (emailCodeStatus === "verified") {
        setEmailCodeStatus("idle");
        setEmailCodeSent(false);
        setEmailCode("");
        setNewEmail(userInfo?.email || "");
      }

      onUpdate();
    } catch (err) {
      console.error("회원정보 수정 실패:", err);
      setMessage(err.response?.data || "회원정보 수정에 실패했습니다");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  // 이메일 변경 요청
  const handleEmailChangeRequest = async () => {
    setEmailCodeStatus("sending");
    try {
      const token = localStorage.getItem("accessToken");
      await api.post(`${API_ENDPOINTS.USER}/email/change-request`, null, {
        params: { email: newEmail },
        headers: { Authorization: `Bearer ${token}` },
      });

      setEmailCodeSent(true);
      setEmailCodeStatus("sent");
      setEmailTimer(180);
      const interval = setInterval(() => {
        setEmailTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setEmailCodeSent(false);
            setEmailCodeStatus("expired");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setEmailInterval(interval);
    } catch (err) {
      setEmailCodeStatus("idle");
      setMessage(err.response?.data || "인증 코드 전송에 실패했습니다");
      setMessageType("error");
    }
  };

  // 이메일 변경 확인
  const handleEmailChangeConfirm = async () => {
    if (!emailCode) {
      setMessage("인증 코드를 입력해주세요");
      setMessageType("error");
      return;
    }

    try {
      await api.post(`${API_ENDPOINTS.AUTH}/email/verify`, {
        email: newEmail,
        code: emailCode,
      });

      setEmailCodeStatus("verified");
      clearInterval(emailInterval);
    } catch (err) {
      setEmailCodeStatus("error");
      setEmailCode("");
    }
  };

  const checkEmailDuplicate = async (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValidFormat = emailRegex.test(email);

    if (!isValidFormat) {
      if (email === "") {
        setEmailStatus("idle");
        setErrors((prev) => ({ ...prev, email: "" }));
      } else {
        setEmailStatus("invalid");
        setErrors((prev) => ({
          ...prev,
          email: "올바른 이메일 형식으로 입력해 주세요",
        }));
      }
      return;
    }

    setEmailStatus("checking");
    setErrors((prev) => ({ ...prev, email: "" }));

    try {
      const token = localStorage.getItem("accessToken");
      const res = await api.get(`${API_ENDPOINTS.AUTH}/check-email/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data) {
        setEmailStatus("invalid");
        setErrors((prev) => ({
          ...prev,
          email: "이미 사용 중인 이메일입니다",
        }));
      } else {
        setEmailStatus("valid");
        setErrors((prev) => ({ ...prev, email: "" }));
      }
    } catch (err) {
      setEmailStatus("invalid");
      setErrors((prev) => ({
        ...prev,
        email: "중복 검사 중 오류가 발생했습니다",
      }));
    }
  };

  const debouncedCheckEmail = useMemo(
    () => debounce(checkEmailDuplicate, 500),
    []
  );

  const handleEmailChange = (e) => {
    const { value } = e.target;
    setNewEmail(value);
    setMessage("");
    setEmailCodeSent(false);
    setEmailCode("");
    setEmailCodeStatus("idle");
    clearInterval(emailInterval);
    setEmailTimer(0);

    if (value === userInfo?.email) {
      setEmailStatus("idle");
      setErrors((prev) => ({ ...prev, email: "" }));
      return;
    }

    if (value === "") {
      setEmailStatus("idle");
      setErrors((prev) => ({ ...prev, email: "" }));
      return;
    }

    setEmailStatus("checking");
    setErrors((prev) => ({ ...prev, email: "" }));
    debouncedCheckEmail(value);
  };

  // 닉네임 변경 가능일
  const getNicknameStatusMessage = () => {
    if (!userInfo?.nicknameUnlockAt) return null;

    const unlockDate = new Date(userInfo.nicknameUnlockAt);
    const now = new Date();

    if (now < unlockDate) {
      return `${unlockDate.toLocaleDateString()} ${unlockDate.toLocaleTimeString()}에 변경 가능합니다`;
    }
    return null;
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>기본 정보 수정</h2>

      <form onSubmit={handleBasicInfoSubmit} className={styles.form}>
        {/* 아이디 (읽기전용) */}
        <div className={styles.formGroup}>
          <label className={styles.label}>아이디</label>
          <div className={styles.inputWrapper}>
            <img src={IdIcon} alt="아이디" className={styles.inputIcon} />
            <input
              type="text"
              value={userInfo?.id || ""}
              disabled
              className={`${styles.formInput} ${styles.disabled}`}
            />
          </div>
          <div className={styles.helpText}>아이디는 변경할 수 없습니다</div>
        </div>

        {/* 이름 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>이름</label>
          <div className={styles.inputWrapper}>
            <img src={NameIcon} alt="이름" className={styles.inputIcon} />
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              onFocus={() => {
                setFocusedField("name");
                setMessage("");
              }}
              onBlur={() => setFocusedField(null)}
              onKeyDown={(e) => e.key === " " && e.preventDefault()}
              className={`${styles.formInput} ${
                errors.name
                  ? styles.inputError
                  : form.name !== userInfo?.name && form.name !== ""
                  ? styles.inputValid
                  : ""
              }`}
              placeholder="이름을 입력해 주세요"
            />
          </div>
          {focusedField === "name" && errors.name && form.name && (
            <div className={styles.errorText}>{errors.name}</div>
          )}
        </div>

        {/* 닉네임 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>닉네임</label>
          <div className={styles.inputWrapper}>
            <img src={NicknameIcon} alt="닉네임" className={styles.inputIcon} />
            <input
              type="text"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              onFocus={() => {
                setFocusedField("nickname");
                setMessage("");
              }}
              onBlur={() => setFocusedField(null)}
              onKeyDown={(e) => e.key === " " && e.preventDefault()}
              disabled={getNicknameStatusMessage() !== null}
              className={`${styles.formInput} ${
                getNicknameStatusMessage() !== null
                  ? styles.disabled
                  : errors.nickname
                  ? styles.inputError
                  : form.nickname !== userInfo?.nickname && form.nickname !== ""
                  ? styles.inputValid
                  : ""
              }`}
              placeholder="닉네임을 입력해 주세요"
            />
          </div>
          {focusedField === "nickname" && errors.nickname && form.nickname ? (
            <div className={styles.errorText}>{errors.nickname}</div>
          ) : getNicknameStatusMessage() ? (
            <div className={styles.warningText}>
              {getNicknameStatusMessage()}
            </div>
          ) : (
            <div className={styles.helpText}>
              닉네임은 30일마다 변경 가능합니다
            </div>
          )}
        </div>

        {/* 전화번호 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>전화번호</label>
          <div className={styles.inputWrapper}>
            <img src={TelIcon} alt="전화번호" className={styles.inputIcon} />
            <input
              type="text"
              name="tel"
              value={form.tel}
              onChange={handleChange}
              onFocus={() => {
                setFocusedField("tel");
                setMessage("");
              }}
              onBlur={() => setFocusedField(null)}
              onKeyDown={(e) => e.key === " " && e.preventDefault()}
              className={`${styles.formInput} ${
                errors.tel
                  ? styles.inputError
                  : form.tel !== userInfo?.tel && form.tel !== ""
                  ? styles.inputValid
                  : ""
              }`}
              placeholder="전화번호를 입력해 주세요"
            />
          </div>
          {focusedField === "tel" && errors.tel && (
            <div className={styles.errorText}>{errors.tel}</div>
          )}
        </div>

        {/* 이메일 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>이메일</label>
          <div className={styles.inputWrapper}>
            <img src={EmailIcon} alt="이메일" className={styles.inputIcon} />
            <input
              type="text"
              value={newEmail}
              onChange={handleEmailChange}
              onFocus={() => {
                setFocusedField("email");
                setMessage("");
              }}
              onBlur={() => setFocusedField(null)}
              className={`${styles.formInput} ${
                newEmail === userInfo?.email || newEmail === ""
                  ? ""
                  : errors.email
                  ? styles.inputError
                  : emailStatus === "valid"
                  ? styles.inputValid
                  : ""
              }`}
              placeholder="이메일을 입력해 주세요"
            />
          </div>
          {newEmail === userInfo?.email ? (
            <div className={styles.helpText}>
              이메일 변경 시 인증이 필요합니다
            </div>
          ) : focusedField === "email" && errors.email ? (
            <div className={styles.errorText}>{errors.email}</div>
          ) : emailStatus === "valid" ? (
            <>
              <div className={styles.emailCodeWrapper}>
                <input
                  type="text"
                  placeholder="인증코드를 입력해 주세요"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value.trim())}
                  onFocus={() => setMessage("")}
                  disabled={emailCodeStatus !== "sent"}
                  className={`${styles.emailCodeInput} ${
                    emailCode === ""
                      ? ""
                      : emailCodeStatus === "verified"
                      ? styles.inputValid
                      : emailCodeStatus === "error" ||
                        emailCodeStatus === "expired"
                      ? styles.inputError
                      : ""
                  }`}
                />
                <button
                  type="button"
                  disabled={
                    emailCodeStatus === "verified" || emailStatus !== "valid"
                  }
                  onClick={() => {
                    setMessage("");
                    if (emailCodeStatus === "sent" && emailCode) {
                      handleEmailChangeConfirm();
                    } else {
                      handleEmailChangeRequest();
                    }
                  }}
                  className={`${styles.verifyButton} ${
                    emailCodeStatus === "verified" ? styles.buttonValid : ""
                  }`}
                >
                  {emailCodeStatus === "sending" ? (
                    <Circles height="20" width="20" color="#888" />
                  ) : emailCodeStatus === "verified" ? (
                    "인증 완료"
                  ) : emailCodeStatus === "sent" ? (
                    emailCode ? (
                      `인증 (${emailTimer}s)`
                    ) : (
                      `전송됨 (${emailTimer}s)`
                    )
                  ) : emailCodeStatus === "expired" ||
                    emailCodeStatus === "error" ? (
                    "재전송"
                  ) : (
                    "전송"
                  )}
                </button>
              </div>
              {(emailCodeStatus === "error" ||
                emailCodeStatus === "expired") && (
                <div className={styles.errorText}>
                  인증코드가 올바르지 않거나 만료되었습니다. 다시 시도해주세요.
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* 메시지 */}
        {message && (
          <div className={`${styles.message} ${styles[messageType]}`}>
            {messageType === "error" && (
              <span className={styles.errorIcon}>!</span>
            )}
            {message}
          </div>
        )}

        {/* 저장 버튼 */}
        <button
          type="submit"
          disabled={isLoading}
          className={styles.submitButton}
        >
          {isLoading ? <Circles height="20" width="20" color="#fff" /> : "저장"}
        </button>
      </form>
    </div>
  );
}
