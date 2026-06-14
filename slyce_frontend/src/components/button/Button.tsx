import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "unstyled";
  size?: "sm" | "md" | "lg";
}

const Button = ({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) => {
  const base = styles.button;

  const variants = {
    primary: styles.primary,
    secondary: styles.secondary,
    ghost: styles.ghost,
    danger: styles.danger,
    unstyled: styles.unstyled,
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
