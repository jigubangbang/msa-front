import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_ENDPOINTS from "../../utils/constants";
import styles from "./Register.module.css";
import CheckIcon from "../../assets/auth/check.svg";
import CancelIcon from "../../assets/auth/cancel.svg";
import IdIcon from "../../assets/auth/id.svg";
import PasswordIcon from "../../assets/auth/password.svg";
import VisibleIcon from "../../assets/auth/visible.svg";
import VisibleOffIcon from "../../assets/auth/visible_off.svg";
import NameIcon from "../../assets/auth/name.svg";
import NicknameIcon from "../../assets/auth/nickname.svg";
import TelIcon from "../../assets/auth/tel.svg";
import EmailIcon from "../../assets/auth/email.svg";
import { Circles } from "react-loader-spinner";
import debounce from "lodash.debounce";

const Register = () => {
  const navigate = useNavigate();

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

  const [errors, setErrors] = useState({});
  const [validationStatus, setValidationStatus] = useState({ userId: "neutral" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [emailStatus, setEmailStatus] = useState("idle"); 
  // 'idle' | 'format-error' | 'checking' | 'valid' | 'duplicate' | 'sending' | 'sent' | 'verified' | 'expired'
  const [emailCode, setEmailCode] = useState("");
  const [emailTimer, setEmailTimer] = useState(0);
  const [emailInterval, setEmailInterval] = useState(null);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    const cleanedValue = value.replace(/\s/g, "");

    setForm((prev) => ({ ...prev, [name]: cleanedValue }));

    if (name === "userId") {
      if (cleanedValue === "") {
        setValidationStatus((prev) => ({ ...prev, userId: "neutral" }));
        setErrors((prev) => ({ ...prev, userId: "" }));
      } else {
        validateUserId(cleanedValue);
      }
    }

    if (name === "password") {
      const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,20}$/;
      if (!passwordPattern.test(cleanedValue)) {
        setErrors((prev) => ({
          ...prev,
          password: "비밀번호는 8~20자의 영문, 숫자, 특수문자를 모두 포함해야 합니다",
        }));
      } else {
        setErrors((prev) => ({ ...prev, password: "" }));
      }

      if (form.confirmPassword && form.confirmPassword !== cleanedValue) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "비밀번호가 일치하지 않습니다",
        }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
      }
    }

    if (name === "confirmPassword") {
      if (cleanedValue !== form.password) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "비밀번호가 일치하지 않습니다",
        }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
      }
    }

    if (name === "name") {
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
      const onlyDigits = value.replace(/\D/g, ""); 

      let formatted = onlyDigits;
      if (onlyDigits.length <= 3) {
        formatted = onlyDigits;
      } else if (onlyDigits.length <= 7) {
        formatted = `${onlyDigits.slice(0, 3)}-${onlyDigits.slice(3)}`;
      } else {
        formatted = `${onlyDigits.slice(0, 3)}-${onlyDigits.slice(3, 7)}-${onlyDigits.slice(7, 11)}`;
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

    if (name === "email") {
      const cleanedValue = value.replace(/\s/g, "");
      setForm((prev) => ({ ...prev, [name]: cleanedValue }));

      setEmailStatus("checking");
      setErrors((prev) => ({ ...prev, email: "" }));

      debouncedCheckEmail(cleanedValue);
      return;
    }
  };

  useEffect(() => {
    return () => {
      debouncedCheckEmail.cancel();
    };
  }, []);

  useEffect(() => {
    if (
      emailStatus === "verified" ||
      emailStatus === "sent" ||
      emailStatus === "expired"
    ) {
      setEmailStatus("idle");
      setEmailCode("");
      clearInterval(emailInterval);
    }
  }, [form.email]);

  const validateUserId = async (value) => {
    const pattern = /^[a-zA-Z0-9]{6,12}$/;
    if (!pattern.test(value)) {
      setErrors((prev) => ({
        ...prev,
        userId: "아이디는 6~12자의 영문, 숫자만 입력 가능합니다",
      }));
      setValidationStatus((prev) => ({ ...prev, userId: "invalid" }));
      return;
    }

    setValidationStatus((prev) => ({ ...prev, userId: "checking" }));
    setErrors((prev) => ({ ...prev, userId: "" }));

    try {
      const res = await axios.get(`${API_ENDPOINTS.AUTH}/check-id/${value}`);
      const isDuplicate = res.data;

      if (isDuplicate) {
        setErrors((prev) => ({
          ...prev,
          userId: "이미 사용 중인 아이디입니다",
        }));
        setValidationStatus((prev) => ({ ...prev, userId: "invalid" }));
      } else {
        setValidationStatus((prev) => ({ ...prev, userId: "valid" }));
      }
    } catch (err) {
      console.error("중복 검사 오류:", err);
      setErrors((prev) => ({
        ...prev,
        userId: "중복 검사 중 오류가 발생했습니다",
      }));
      setValidationStatus((prev) => ({ ...prev, userId: "invalid" }));
    }
  };

  const checkEmailDuplicate = async (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValidFormat = emailRegex.test(email);

    if (!isValidFormat) {
      setEmailStatus("format-error");
      setErrors((prev) => ({ ...prev, email: "올바른 이메일 형식으로 입력해 주세요" }));
      return;
    }

    setEmailStatus("checking");
    setErrors((prev) => ({ ...prev, email: "" }));

    try {
      const res = await axios.get(`${API_ENDPOINTS.AUTH}/check-email/${email}`);
      const isDuplicate = res.data;

      if (isDuplicate) {
        setEmailStatus("duplicate");
        setErrors((prev) => ({ ...prev, email: "이미 사용 중인 이메일입니다" }));
      } else {
        setEmailStatus("valid");
        setErrors((prev) => ({ ...prev, email: "" }));
      }
    } catch (err) {
      setEmailStatus("format-error");
      setErrors((prev) => ({ ...prev, email: "중복 검사 중 오류가 발생했습니다" }));
    }

    if (emailStatus === "verified") {
      setEmailStatus("valid");
    }
  };

  const debouncedCheckEmail = useMemo(() => debounce(checkEmailDuplicate, 200), []);

  const sendVerificationCode = async () => {
    setEmailStatus("sending");
    try {
      await axios.post(`${API_ENDPOINTS.AUTH}/email/send`, { email: form.email });
      setEmailStatus("sent");
      setEmailTimer(180); // 3분 타이머
      const interval = setInterval(() => {
        setEmailTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setEmailStatus("expired");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setEmailInterval(interval);
    } catch {
      setEmailStatus("valid");
      alert("인증코드 전송에 실패했습니다.");
    }
  };

  const verifyCode = async () => {
    try {
      const res = await axios.post(`${API_ENDPOINTS.AUTH}/email/verify`, {
        email: form.email,
        code: emailCode,
      });
      if (res.status === 200) {
        setEmailStatus("verified");
        clearInterval(emailInterval);
      } else {
        alert("인증코드가 올바르지 않습니다.");
      }
    } catch {
      alert("인증코드 확인에 실패했습니다.");
    }
  };

  return (
    <div className={styles.registerPage}>
      <div className={styles.registerContainer}>
        <div className={styles.registerHeader}>
          <div className={styles.logo}>Join JIGUBB and Share your Journey!</div>
        </div>

        <form className={styles.registerForm}>
          <div className={styles.formContent}>
            {/* 왼쪽 */}
            <div className={styles.leftColumn}>
              {/* 약관 필수/선택 항목 이후 추가 */}
            </div>

            {/* 오른쪽 */}
            <div className={styles.rightColumn}>
              {/* ID */}
              <div className={styles.formGroup}>
                <div className={styles.inputWrapper}>
                  <img src={IdIcon} alt="아이디" className={styles.inputIcon} />
                  <input
                    type="text"
                    name="userId"
                    onFocus={() => setFocusedField("userId")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="아이디를 입력해 주세요"
                    value={form.userId}
                    onChange={handleChange}
                    onKeyDown={(e) => e.key === " " && e.preventDefault()}
                    className={`${styles.formInput} ${
                      form.userId === ""
                        ? ""
                        : errors.userId
                        ? styles.inputError
                        : validationStatus.userId === "valid"
                        ? styles.inputValid
                        : ""
                    }`}
                  />
                  {form.userId && validationStatus.userId === "valid" && (
                    <img src={CheckIcon} alt="사용 가능" className={styles.statusIcon} />
                  )}
                  {form.userId && validationStatus.userId === "invalid" && (
                    <img src={CancelIcon} alt="사용 불가" className={styles.statusIcon} />
                  )}
                </div>
                {focusedField === "userId" && errors.userId && (
                  <div className={styles.errorText}>{errors.userId}</div>
                )}
                {focusedField === "userId" && validationStatus.userId === "valid" && !errors.userId && (
                  <div className={styles.successText}>사용 가능한 아이디입니다</div>
                )}
              </div>
              
              {/* 비밀번호 */}
              <div className={styles.formGroup}>
                <div className={styles.inputWrapper}>
                  <img src={PasswordIcon} alt="비밀번호" className={styles.inputIcon} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}    
                    placeholder="비밀번호를 입력해 주세요"
                    value={form.password}
                    onChange={handleChange}
                    onKeyDown={(e) => e.key === " " && e.preventDefault()}
                    className={`${styles.formInput} ${
                      form.password === ""
                        ? ""
                        : errors.password
                        ? styles.inputError
                        : styles.inputValid
                    }`}
                  />
                  <img
                    src={showPassword ? VisibleIcon : VisibleOffIcon}
                    alt="비밀번호 보기"
                    className={styles.toggleIcon}
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </div>
                {focusedField === "password" && errors.password && (
                  <div className={styles.errorText}>{errors.password}</div>
                )}
              </div>

              {/* 비밀번호 확인 */}
              <div className={styles.formGroup}>
                <div className={styles.inputWrapper}>
                  <img src={PasswordIcon} alt="비밀번호 확인" className={styles.inputIcon} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="비밀번호를 확인해 주세요"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    onKeyDown={(e) => e.key === " " && e.preventDefault()}
                    className={`${styles.formInput} ${
                      form.confirmPassword === ""
                        ? ""
                        : errors.confirmPassword
                        ? styles.inputError
                        : styles.inputValid
                    }`}
                  />
                  <img
                    src={showConfirmPassword ? VisibleIcon : VisibleOffIcon}
                    alt="비밀번호 확인 보기"
                    className={styles.toggleIcon}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                </div>
                {focusedField === "confirmPassword" && errors.confirmPassword && (
                  <div className={styles.errorText}>{errors.confirmPassword}</div>
                )}
              </div>

              {/* 이름 */}
              <div className={styles.formGroup}>
                <div className={styles.inputWrapper}>
                  <img src={NameIcon} alt="이름" className={styles.inputIcon} />
                  <input
                    type="text"
                    name="name"
                    placeholder="이름을 입력해 주세요"
                    value={form.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    onKeyDown={(e) => e.key === " " && e.preventDefault()}
                    className={`${styles.formInput} ${
                      form.name === ""
                        ? ""
                        : errors.name
                        ? styles.inputError
                        : styles.inputValid
                    }`}
                  />
                </div>
                {focusedField === "name" && errors.name && (
                  <div className={styles.errorText}>{errors.name}</div>
                )}
              </div>

              {/* 닉네임 */}
              <div className={styles.formGroup}>
                <div className={styles.inputWrapper}>
                  <img src={NicknameIcon} alt="닉네임" className={styles.inputIcon} />
                  <input
                    type="text"
                    name="nickname"
                    placeholder="닉네임을 입력해 주세요"
                    value={form.nickname}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("nickname")}
                    onBlur={() => setFocusedField(null)}
                    onKeyDown={(e) => e.key === " " && e.preventDefault()}
                    className={`${styles.formInput} ${
                      form.nickname === ""
                        ? ""
                        : errors.nickname
                        ? styles.inputError
                        : styles.inputValid
                    }`}
                  />
                </div>
                {focusedField === "nickname" && errors.nickname && (
                  <div className={styles.errorText}>{errors.nickname}</div>
                )}
              </div>

              {/* 전화번호 */}
              <div className={styles.formGroup}>
                <div className={styles.inputWrapper}>
                  <img src={TelIcon} alt="전화번호" className={styles.inputIcon} />
                  <input
                    type="text"
                    name="tel"
                    placeholder="전화번호를 입력해 주세요"
                    value={form.tel}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("tel")}
                    onBlur={() => setFocusedField(null)}
                    onKeyDown={(e) => e.key === " " && e.preventDefault()}
                    className={`${styles.formInput} ${
                      form.tel === ""
                        ? ""
                        : errors.tel
                        ? styles.inputError
                        : styles.inputValid
                    }`}
                  />
                </div>
                {focusedField === "tel" && errors.tel && (
                  <div className={styles.errorText}>{errors.tel}</div>
                )}
              </div>

              {/* 이메일 */}
              <div className={styles.formGroup}>
                <div className={styles.inputWrapper}>
                  <img src={EmailIcon} alt="이메일" className={styles.inputIcon} />
                  <input
                    type="text"
                    name="email"
                    placeholder="이메일을 입력해 주세요"
                    value={form.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    className={`${styles.formInput} ${
                      form.email === ""
                        ? ""
                        : errors.email
                        ? styles.inputError
                        : emailStatus === "valid" || emailStatus === "verified"
                        ? styles.inputValid
                        : ""
                    }`}
                  />
                  {emailStatus === "valid" || emailStatus === "verified" ? (
                    <img src={CheckIcon} alt="사용 가능" className={styles.statusIcon} />
                  ) : emailStatus === "duplicate" || emailStatus === "format-error" ? (
                    <img src={CancelIcon} alt="사용 불가" className={styles.statusIcon} />
                  ) : null}
                </div>
                {focusedField === "email" && errors.email && (
                  <div className={styles.errorText}>{errors.email}</div>
                )}
              </div>
              
              {/* 이메일 인증코드 */}
              <div className={styles.formGroup}>
                <div className={styles.emailCodeWrapper}>
                  <input
                    type="text"
                    name="emailCode"
                    placeholder="인증코드를 입력해 주세요"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value.trim())}
                    disabled={emailStatus !== "valid" && emailStatus !== "sent" && emailStatus !== "expired"}
                    className={styles.emailCodeInput}
                  />
                  <button
                    type="button"
                    disabled={emailStatus !== "valid" && emailStatus !== "sent" && emailStatus !== "expired"}
                    onClick={
                      emailStatus === "sent" || emailStatus === "expired"
                        ? verifyCode
                        : sendVerificationCode
                    }
                    className={styles.verifyButton}
                  >
                    {emailStatus === "sending" ? (
                      <Circles height="20" width="20" color="#888" />
                    ) : emailStatus === "sent" ? (
                      emailTimer > 0 ? `전송됨 (${emailTimer}s)` : "만료됨"
                    ) : emailStatus === "verified" ? (
                      "인증 완료"
                    ) : (
                      "전송"
                    )}
                  </button>
                </div>

                {emailStatus === "expired" && (
                  <div className={styles.errorText}>
                    유효하지 않거나 만료된 인증코드입니다. 다시 시도해주세요.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.loginLink}>
            이미 계정이 있으신가요?{" "}
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => navigate("/login")}
            >
              로그인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
