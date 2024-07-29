import { ButtonHTMLAttributes } from "react";

interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const Button = ({
  className = "",
  onClick,
  disabled = false,
  children,
  ...props
}: IButtonProps) => {
  const handleOnClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick && onClick(event);
  };

  return (
    <button
      className={
        "text-white md:block bg-blue-700 hover:brightness-75 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-[1rem] sm:w-auto px-5 py-2.5 text-center  " +
        className
      }
      disabled={disabled}
      onClick={handleOnClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
