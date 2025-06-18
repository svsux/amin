export default function InputField({
  label,
  id,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder,
  min,
  step,
  minLength,
  className,
  icon,
}: {
  label: string;
  id: string;
  type?: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  min?: number;
  step?: string;
  minLength?: number;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-[#A0A8B8] mb-1"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          min={min}
          step={step}
          minLength={minLength}
          className={`block w-full px-3 py-2 ${
            icon ? "pl-10" : ""
          } bg-[#121418] border border-[#1E2228] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-[#0066FF] sm:text-sm transition-colors text-white placeholder:text-[#A0A8B8]/50 ${className || ""}`}
        />
      </div>
    </div>
  );
}
