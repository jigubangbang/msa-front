
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./SideBar.module.css";
import LoginConfirmModal from "../LoginConfirmModal/LoginConfirmModal";

//menu에 어떤 요소들을 넣을 것인지 받아옴
export default function Sidebar({ menuItems = [], isLogin = false}) {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationRef = useRef(null);

  const [loginModal, setLoginModal] = useState({
    isOpen: false,
    targetPath: ''
  });

  const scrollToActiveMenu = () => {
    if (!navigationRef.current) return;
    
    const activeElement = navigationRef.current.querySelector(`.${styles.active}`);
    if (activeElement) {
      activeElement.scrollIntoView({ 
        behavior: 'instant', 
        block: 'center' 
      });
    }
  };

  useEffect(() => {
    scrollToActiveMenu();
  }, [location.pathname]);

  const handleMenuClick = (path, needLogin = false) => {
    if (needLogin && !isLogin) {
      setLoginModal({
        isOpen: true,
        targetPath: path
      });
      return;
    }

    if (path) {
      window.scrollTo(0, 0);
      navigate(path);
    }
  };

  const handleSubmenuClick = (path, needLogin = false) => {
    if (needLogin && !isLogin) {
      setLoginModal({
        isOpen: true,
        targetPath: path
      });
      return;
    }

    if (path) {
      window.scrollTo(0, 0);
      navigate(path);
    }
  };

    const handleLoginConfirm = () => {
    setLoginModal({ isOpen: false, targetPath: '' });
    navigate('/login');
  };

  const handleLoginCancel = () => {
    setLoginModal({ isOpen: false, targetPath: '' });
  };


  // 현재 경로와 메뉴 경로를 비교하여 active 상태 확인
  const isActive = (path) => {
    return location.pathname === path;
  };

  // 메인 메뉴가 active인지 확인 (자신의 path나 서브메뉴 중 하나가 active인 경우)
  const isMainMenuActive = (item) => {
    if (isActive(item.path)) {
      return true;
    }

    // 서브메뉴 중 하나가 active인지 확인
    if (item.submenus && item.submenus.length > 0) {
      return item.submenus.some((submenu) => isActive(submenu.path));
    }

    return false;
  };

  return (
    <>
      <div className={styles.sidebar}>
        {/* Menu Items */}
        <nav className={styles.navigation} ref={navigationRef}>
          {menuItems.map((item, index) => (
            <div key={index} className={styles.menuGroup}>
              {/* 메인 메뉴 */}
              <div
                className={`${styles.menuButton} ${
                  isMainMenuActive(item) ? styles.active : ""
                }`}
                onClick={() => handleMenuClick(item.path, item.needLogin)}
              >
                <div className={styles.menuIcon}>
                  {item.icon && <img src={item.icon} alt={item.label} />}
                </div>
                <div className={styles.menuContent}>
                  <span className={styles.menuLabel}>{item.label}</span>
                  {item.badge && (
                    <span className={styles.badge}>{item.badge}</span>
                  )}
                </div>
              </div>

              {/* 서브메뉴 */}
              {item.submenus && item.submenus.length > 0 && (
                <div className={styles.submenuContainer}>
                  {item.submenus.map((submenu, subIndex) => (
                    <div
                      key={subIndex}
                      className={`${styles.submenuItem} ${
                        isActive(submenu.path) ? styles.active : ""
                      }`}
                      onClick={() => handleSubmenuClick(submenu.path, submenu.needLogin)}
                    >
                      <span>{submenu.label}</span>
                      {submenu.badge && (
                        <span className={styles.badge}>{submenu.badge}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className={styles.bottomSection}>
          {/* Settings & Support can be added here */}
        </div>
      </div>

      {/* 로그인 확인 모달 */}
      <LoginConfirmModal
        isOpen={loginModal.isOpen}
        onClose={handleLoginCancel}
        onConfirm={handleLoginConfirm}
      />
    </>
  );
}