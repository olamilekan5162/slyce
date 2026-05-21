import React from 'react';
import toast from 'react-hot-toast';
import { Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './SignIn.module.css';

const SignIn = () => {
  const navigate = useNavigate();
  const handleGoogleSignIn = () => {
    toast.success("Signed in with Google");
    navigate('/dashboard');
  };

  const handleWalletSignIn = () => {
    toast("Wallet connection coming soon", { icon: "🔜" });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.logo} onClick={() => navigate('/')}>
        slyce<span className={styles.dot}></span>
      </div>

      <div className={styles.card}>
        <h1 className={styles.title}>Sign in to slyce</h1>
        
        <button className={`btn-primary ${styles.googleBtn}`} onClick={handleGoogleSignIn}>
          <Globe size={20} />
          Continue with Google
        </button>
        
        <div className={styles.divider}>
          <span>or</span>
        </div>
        
        <button 
          className={`btn-ghost ${styles.walletBtn}`} 
          onClick={handleWalletSignIn}
        >
          Connect Wallet
        </button>

        <p className={styles.footnote}>
          No seed phrases. No crypto knowledge needed.<br/>
          Your wallet is created automatically.
        </p>
      </div>
    </div>
  );
};

export default SignIn;
