type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

export default function Button({ children, onClick, className }: ButtonProps) {
  return (
    <button onClick={onClick} className={`${className} rounded-sm text-white flex items-center justify-center gap-2 text-md font-semibold`}>
      {children}
    </button>
  );
}
