import styles from "./Card.module.css";

const Card = ({
  variant = "light",
  children,
  className = "",
  onClick = () => {},
}) => {
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
      style={{ cursor: onClick && "pointer" }}
    >
      {children}
    </div>
  );
};

export default Card;
