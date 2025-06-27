import { cn } from "@/lib/utils";

interface FormInputProps {
  name: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  defaultValue?: string;
  errors?: { _errors: string[] };
  className?: string;
}

export function FormInput({
  name,
  label,
  errors,
  className,
  required = true,
  ...props
}: FormInputProps) {
  return (
    <div>
      {label && (
        <label
          htmlFor={name}
          className={`block text-sm font-medium text-gray-800 ${required ? "after:ml-0.5 after:text-red-500 after:content-['*']" : ""}`}
        >
          {label}
        </label>
      )}
      <input
        {...props}
        id={name}
        name={name}
        required={required}
        className={cn(
          "mt-2.5 block w-full rounded-lg border bg-gray-100 p-4 text-gray-800 shadow-sm transition-all duration-200 placeholder:text-sm placeholder:text-gray-400 hover:ring-2 hover:ring-gray-300 focus:ring-2 focus:ring-gray-800 focus:outline-none",
          errors ? "border-red-500 bg-red-50" : "border-gray-300",
          className,
        )}
      />
      {errors && (
        <small className="mt-1 text-sm text-red-500">{errors._errors[0]}</small>
      )}
    </div>
  );
}
