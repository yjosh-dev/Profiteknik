type InputProps = {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  name: string;
};

export default function Input({
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
  className = "",
  name = "",
}: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="input" className="font-semibold">
        {name}
      </label>
      <input
        id="input"
        name="input"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
