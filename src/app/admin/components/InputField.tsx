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
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
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
          } border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors text-gray-900 ${className || ""}`}
        />
      </div>
    </div>
  );
}
