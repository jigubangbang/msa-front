import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.css';

//menu에 어떤 요소들을 넣을 것인지 받아옴
const Sidebar = ({ 
  menuItems = []
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleMenuClick = (path, hasSubmenus) => {
    if (path && !hasSubmenus) {
      navigate(path);
    }
  };

  const handleSubmenuClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <div 
      className={`${styles.sidebar} ${isExpanded ? styles.expanded : ''}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Menu Items */}
      <nav className={styles.navigation}>
        {menuItems.map((item, index) => (
          <div key={index} className={styles.menuItem}>
            <div 
              className={`${styles.menuButton} ${item.active ? styles.active : ''}`}
              onClick={() => handleMenuClick(item.path, item.submenus && item.submenus.length > 0)}
            >
              <div className={styles.menuIcon}>
                {item.icon && <img src={item.icon} alt={item.label} />}
              </div>
              {isExpanded && (
                <div className={styles.menuContent}>
                  <span className={styles.menuLabel}>{item.label}</span>
                  {item.badge && (
                    <span className={styles.badge}>{item.badge}</span>
                  )}
                </div>
              )}
            </div>
            
            {/* Submenus */}
            {isExpanded && item.submenus && item.submenus.length > 0 && (
              <div className={styles.submenuContainer}>
                {item.submenus.map((submenu, subIndex) => (
                  <div 
                    key={subIndex}
                    className={`${styles.submenuItem} ${submenu.active ? styles.active : ''}`}
                    onClick={() => handleSubmenuClick(submenu.path)}
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
  );
};

export default Sidebar;