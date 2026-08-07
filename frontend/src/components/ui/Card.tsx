type CardProps = {
  children: React.ReactNode;
  className?: string
};

export default function Card({ children, className }: CardProps) {
  return (
    <div className={`bg-white shadow-md border border-gray-200 rounded-md flex flex-col items-center ${className}`}>
      {children}
    </div>
  );
}