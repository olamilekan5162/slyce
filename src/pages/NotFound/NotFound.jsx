import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './NotFound.module.css';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.wrapper}>
      <h1 className={styles.errorCode}>404</h1>
      <h2 className={styles.title}>Page Not Found</h2>
      <p className={styles.message}>
        The page you are looking for doesn't exist or has been moved.
      </p>
      <button className="btn-primary" onClick={() => navigate('/')}>
        <ArrowLeft size={16} /> Return Home
      </button>
    </div>
  );
};

export default NotFound;
