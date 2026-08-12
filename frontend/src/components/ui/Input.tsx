type InputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  name: string;
  text: string;
  icon?: React.ReactNode;
};

export default function Input({
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
  className,
  name = "",
  text = "",
  icon,
}: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        {icon}
        <label htmlFor={name} className="font-semibold">
          {text}
        </label>
      </div>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`flex h-8 rounded-md border border-input bg-background px-3 py-2 text-sm 
                   shadow-sm transition-colors 
                   placeholder:text-muted-foreground 
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 
                   disabled:cursor-not-allowed disabled:opacity-50 h-8 ${className}`}
      />
    </div>
  );
}
