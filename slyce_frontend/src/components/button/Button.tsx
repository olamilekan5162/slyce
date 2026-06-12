import styles from "./Button.module.css";

const Button = ({ className, variant, size, children, ...props }: any) => {
  const base = styles.button;

  const variants = {
    primary: styles.primary,
    secondary: styles.secondary,
    ghost: styles.ghost,
    danger: styles.danger,
  };

  const sizes = {
    sm: styles.small,
    md: styles.medium,
    lg: styles.large,
  };

  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;

  return (
    <button
      className={`${base} ${variantClass} ${sizeClass} ${className || ""}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
