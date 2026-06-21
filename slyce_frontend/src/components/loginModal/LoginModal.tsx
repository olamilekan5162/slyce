import { useCallback } from "react";
import {
  useWallets,
  useDAppKit,
  useWalletConnection,
} from "@mysten/dapp-kit-react";
import Modal from "../modal/Modal";
import Button from "../button/Button";
import styles from "./LoginModal.module.css";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const wallets = useWallets();
  const dAppKit = useDAppKit();
  const connection = useWalletConnection();

  const handleConnect = useCallback(
    async (walletName?: string) => {
      if (connection.isConnected) {
        onClose();
        return;
      }

      // Find the wallet by matching the name
      const wallet = walletName
        ? wallets.find((w) =>
            w.name?.toLowerCase().includes(walletName.toLowerCase()),
          )
        : wallets[0];

      console.log("Wallet:", wallet);

      if (wallet) {
        await dAppKit.connectWallet({ wallet });
        onClose();
      }
    },
    [wallets, dAppKit, connection.isConnected, onClose],
  );

  // Identify wallets by name using the exact names from registration
  const slushWallet = wallets.find((w) => w.name === "Slush");
  const googleWallet = wallets.find((w) => w.name === "Sign in with Google");
  // const facebookWallet = wallets.find(
  //   (w) => w.name === "Sign in with Facebook",
  // );
  const hasWallets = wallets.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Connect Wallet">
      <div className={styles.container}>
        <p className={styles.description}>
          {connection.isConnected
            ? "You are connected. Continue to the app."
            : "Connect your wallet to continue. Choose your preferred method below."}
        </p>

        {slushWallet && (
          <Button
            variant="primary"
            size="lg"
            className={styles.connectBtn}
            onClick={() => handleConnect(slushWallet.name)}
          >
            <img
              src={slushWallet.icon}
              alt="Slush"
              className={styles.walletIcon}
            />
            Continue with Slush
          </Button>
        )}

        {!slushWallet && hasWallets && (
          <Button
            variant="primary"
            size="lg"
            className={styles.connectBtn}
            onClick={() => handleConnect()}
          >
            Connect Wallet
          </Button>
        )}

        <div className={styles.dividerContainer}>
          <div className={styles.dividerLine} />
          <span className={styles.dividerText}>OR CONTINUE WITH</span>
          <div className={styles.dividerLine} />
        </div>

        <div className={styles.socialButtons}>
          {googleWallet && (
            <Button
              variant="ghost"
              size="md"
              className={styles.socialBtn}
              onClick={() => handleConnect(googleWallet.name)}
            >
              <img
                src={googleWallet.icon}
                alt="Google"
                className={styles.socialIcon}
              />
              <span>Continue with Google</span>
            </Button>
          )}

          {/* {facebookWallet && (
            <Button
              variant="ghost"
              size="md"
              className={styles.socialBtn}
              onClick={() => handleConnect(facebookWallet.name)}
            >
              <img
                src={facebookWallet.icon}
                alt="Facebook"
                className={styles.socialIcon}
              />
              <span>Continue with Facebook</span>
            </Button>
          )} */}
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
