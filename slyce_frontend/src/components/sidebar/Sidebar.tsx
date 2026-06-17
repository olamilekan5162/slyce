import styles from "./Sidebar.module.css";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, ArrowUpDown, LogOut, User, Wallet } from "lucide-react";
import Button from "../button/Button";
import { dAppKit } from "../../lib/suiClient";
import toast from "react-hot-toast";

const links = [
  {
    label: "Overview",
    icon: Home,
    path: "/app",
  },
  {
    label: "Transactions",
    icon: ArrowUpDown,
    path: "/app/transactions",
  },
  {
    label: "Splits",
    icon: Wallet,
    path: "/app/splits",
  },
  {
    label: "Profile",
    icon: User,
    path: "/app/profile",
  },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleDisconnect = async () => {
    await dAppKit.disconnectWallet();
    toast.success("Wallet disconnected successfully");
    navigate("/");
  };

  return (
    <aside className={styles.sidebar}>
      <div>
        <h1 className={styles.logo}>Slyce</h1>

        <nav className={styles.nav}>
          {links.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/app"}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.active : ""}`
                }
              >
                <Icon size={20} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className={styles.logout}>
        <Button
          variant="unstyled"
          className={styles.logoutBtn}
          onClick={() => handleDisconnect()}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
}
