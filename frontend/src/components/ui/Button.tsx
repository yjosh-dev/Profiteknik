type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean
};


export default function Button({ children, onClick, className, disabled }: ButtonProps) {
  return (
    <button onClick={disabled ? undefined : onClick} className={`${className} rounded-sm text-white flex items-center justify-center gap-2 text-md font-semibold`}>
      {children}
    </button>
  );
}
