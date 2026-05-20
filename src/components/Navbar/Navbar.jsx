import React from 'react';
import styles from './Navbar.module.css';
import { useNavigate } from 'react-router-dom';
import { currentUser } from '../../data/dummy';

const Navbar = ({ currentPath }) => {
  const navigate = useNavigate();
  const isDashboard = currentPath.startsWith('/dashboard') || currentPath.startsWith('/splits');

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.navContainer}`}>
        <div 
          className={styles.logo} 
          onClick={() => navigate('/')}
          role="button"
          tabIndex={0}
        >
          slyce<span className={styles.dot}></span>
        </div>

        {isDashboard ? (
          <div className={styles.dashboardRight}>
            <div className={styles.avatar}>
              {currentUser.initials}
            </div>
            <span className={styles.userName}>{currentUser.name}</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className={styles.caret}
            >
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
        ) : (
          <div className={styles.landingLinks}>
            <a href="#features" onClick={(e) => e.preventDefault()}>Features</a>
            <a href="#how-it-works" onClick={(e) => e.preventDefault()}>How It Works</a>
            <a href="#pricing" onClick={(e) => e.preventDefault()}>Pricing</a>
            <button 
              className="btn-primary" 
              onClick={() => navigate('/signin')}
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
