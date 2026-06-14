import styles from "./Card.module.css";

interface CardProps {
  variant?: "light" | "dark" | "cream";
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card = ({
  variant = "light",
  children,
  className = "",
  onClick,
}: CardProps) => {
  const variantClass =
    variant === "dark"
      ? styles.cardDark
      : variant === "cream"
        ? styles.cardCream
        : styles.cardLight;

  return (
    <div
      className={`${styles.card} ${variantClass} ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {children}
    </div>
  );
};

export default Card;
