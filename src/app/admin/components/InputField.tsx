export default function InputField({
  label, id, type = "text", value, onChange, required = false, placeholder, min, step, minLength,
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
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
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
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors text-gray-900"
      />
    </div>
  );
}