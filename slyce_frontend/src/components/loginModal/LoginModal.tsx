import Modal from "../modal/Modal";
import Button from "../button/Button";
import styles from "./LoginModal.module.css";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onConnect,
}: LoginModalProps) {
  const handleConnect = () => {
    onConnect();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Connect Wallet">
      <div className={styles.container}>
        <p className={styles.description}>
          Connect your wallet to continue. Choose your preferred method below.
        </p>

        <Button
          variant="primary"
          size="lg"
          className={styles.connectBtn}
          onClick={handleConnect}
        >
          Continue with Slush
        </Button>

        <div className={styles.dividerContainer}>
          <div className={styles.dividerLine} />
          <span className={styles.dividerText}>OR CONTINUE WITH</span>
          <div className={styles.dividerLine} />
        </div>

        <div className={styles.socialButtons}>
          <Button
            variant="ghost"
            size="md"
            className={styles.socialBtn}
            onClick={handleConnect}
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                fill="#EA4335"
                d="M12 5.04c1.67 0 3.17.58 4.35 1.71l3.25-3.25C17.63 1.63 14.99 1 12 1 7.37 1 3.4 3.66 1.5 7.54l3.87 3C6.31 7.58 8.94 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.73-2.37 3.57l3.7 2.87c2.16-1.99 3.42-4.91 3.42-8.54z"
              />
              <path
                fill="#FBBC05"
                d="M5.37 14.54c-.24-.72-.37-1.49-.37-2.29s.13-1.57.37-2.29L1.5 6.96C.54 8.87 0 10.99 0 13.25s.54 4.38 1.5 6.29l3.87-3z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.7-2.87c-1.08.72-2.47 1.15-4.26 1.15-3.06 0-5.69-2.54-6.63-5.5l-3.87 3C3.4 19.34 7.37 23 12 23z"
              />
            </svg>
            <span>Continue with Google</span>
          </Button>

          <Button
            variant="ghost"
            size="md"
            className={styles.socialBtn}
            onClick={handleConnect}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Continue with Facebook</span>
          </Button>

          <Button
            variant="ghost"
            size="md"
            className={styles.socialBtn}
            onClick={handleConnect}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.51-.62.73-1.16 1.87-1.01 2.98 1.11.09 2.24-.58 2.94-1.43z" />
            </svg>
            <span>Continue with Apple</span>
          </Button>
        </div>

        <p className={styles.legalText}>
          By continuing, you agree to our{" "}
          <span className={styles.legalLink}>Terms of Service</span> and{" "}
          <span className={styles.legalLink}>Privacy Policy</span>.
        </p>
      </div>
    </Modal>
  );
}
