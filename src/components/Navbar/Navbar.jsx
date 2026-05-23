import React, { useState } from "react";
import styles from "./Navbar.module.css";
import { Link, useNavigate } from "react-router-dom";
import { ConnectButton } from "@mysten/dapp-kit-react/ui";
import { useCurrentAccount } from "@mysten/dapp-kit-react";

const Navbar = ({ currentPath }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const isDashboard =
    currentPath.startsWith("/dashboard") || currentPath.startsWith("/splits");
  const account = useCurrentAccount();

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.navContainer}`}>
        <div
          className={styles.logo}
          onClick={() => navigate("/")}
          role="button"
          tabIndex={0}
        >
          slyce<span className={styles.dot}></span>
        </div>

        {!isDashboard && (
          // <div className={styles.dashboardRight}>
          //   <div className={styles.avatar}>{currentUser.initials}</div>
          //   <span className={styles.userName}>{currentUser.name}</span>
          //   <svg
          //     xmlns="http://www.w3.org/2000/svg"
          //     width="16"
          //     height="16"
          //     viewBox="0 0 24 24"
          //     fill="none"
          //     stroke="currentColor"
          //     strokeWidth="2"
          //     strokeLinecap="round"
          //     strokeLinejoin="round"
          //     className={styles.caret}
          //   >
          //     <path d="m6 9 6 6 6-6" />
          //   </svg>
          // </div>

          <div className={styles.landingLinks}>
            <a href="#features" onClick={(e) => e.preventDefault()}>
              Features
            </a>
            <a href="#how-it-works" onClick={(e) => e.preventDefault()}>
              How It Works
            </a>
            <a href="#pricing" onClick={(e) => e.preventDefault()}>
              Pricing
            </a>
            {account && <Link to="/dashboard">Dashboard</Link>}
          </div>
        )}

        <ConnectButton
          modalOptions={{
            filterFn: (wallet) => wallet.name !== "Slush",
          }}
        />
      </div>
    </nav>
  );
};

export default Navbar;
