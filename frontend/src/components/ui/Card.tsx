type CardProps = {
  children: React.ReactNode;
};

export default function Card({ children }: CardProps) {
  return (
    <div className={`min-w-sm shadow-md border border-gray-200 rounded-md flex flex-col items-center gap-3 justify-center py-10`}>
      {children}
    </div>
  );
}