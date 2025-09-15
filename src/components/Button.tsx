import React from "react";

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  className = "",
  title,
}) => {
  return (
    <button
      onClick={onClick}
      className={`text-white px-2 py-1 rounded hover:bg-[#f1f1f1] transition-colors hover:text-black ${className}`}
      title={title}
    >
      {children}
    </button>
  );
};

export default Button;
