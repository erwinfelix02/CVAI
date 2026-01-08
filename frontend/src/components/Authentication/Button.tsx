import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "white" | "whiteBorder";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const variantClass =
    variant === "outline"
      ? "btn-outline-brand"
      : variant === "white"
      ? "btn-white-brand"
      : variant === "whiteBorder"
      ? "btn-white-border"
      : "btn-brand";

  return (
    <button
      type={props.type ?? "button"}
      className={`btn ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
