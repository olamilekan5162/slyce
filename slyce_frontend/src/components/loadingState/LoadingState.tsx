import { Loader2 } from "lucide-react";
import styles from "./LoadingState.module.css";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

const LoadingState = ({
  message = "Loading...",
  className = "",
}: LoadingStateProps) => {
  return (
    <div className={`${styles.container} ${className}`}>
      <Loader2 className={styles.spinner} size={40} />
      <p className={styles.message}>{message}</p>
    </div>
  );
};

export default LoadingState;
