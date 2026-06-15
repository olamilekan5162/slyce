import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AuthCallback.module.css";

/**
 * Handles the OAuth redirect callback from Enoki.
 * After a user authenticates with Google/Facebook/Twitch,
 * the OAuth provider redirects here with auth parameters in the URL hash.
 * The Enoki wallet handles the callback automatically via the wallet standard interface.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"processing" | "error">("processing");

  useEffect(() => {
    // Enoki wallets handle the OAuth callback via the wallet standard.
    // We just wait a moment for the wallet to process the auth hash,
    // then redirect to the app dashboard.
    const timer = setTimeout(() => {
      // Check if we have a hash (OAuth response) or if we're already connected
      if (window.location.hash || window.location.search) {
        // Enoki wallet should have picked up the auth response.
        // Navigate to the dashboard; the DAppKit provider will
        // handle reconnection automatically via autoConnect.
        navigate("/app", { replace: true });
      } else {
        setStatus("error");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  if (status === "error") {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1>Authentication failed</h1>
          <p>Something went wrong during authentication. Please try again.</p>
          <button className={styles.button} onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.spinner} />
        <h1>Completing authentication...</h1>
        <p>Please wait while we securely connect your account.</p>
      </div>
    </div>
  );
}
