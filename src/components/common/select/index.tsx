import { ChangeEvent, SelectHTMLAttributes, useEffect, useState } from "react";

interface ISelect<T> extends SelectHTMLAttributes<HTMLSelectElement> {
  selectClass?: string;
  optionClass?: string;
  containerClass?: string;
  labelClass?: string;
  label?: string;
  options?: T[];
  onSelectOption: (e: string) => void;
  defaultValue: string | undefined;
}

const Select = <T extends { id: string; name: string }>({
  onSelectOption,
  selectClass,
  optionClass,
  labelClass,
  containerClass,
  required = false,
  name,
  options,
  defaultValue,
  label = "select"
}: ISelect<T>) => {
  const [selectedOption, setSelectedOption] = useState<string | undefined>("");

  useEffect(() => {
    if (!defaultValue) return;

    setSelectedOption(defaultValue);
  }, [defaultValue]);

  const handleOnchange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e.target.value);
    onSelectOption && onSelectOption(e.target.value);
  };
  return (
    <label htmlFor='form' className={containerClass + " block text-sm font-medium text-gray-900"}>
      <span className={labelClass}>
        {label} {required && <span className='text-xl text-red-500'>*</span>}
      </span>
      <select
        id={name}
        name={name}
        className={
          selectClass +
          " w-auto bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 "
        }
        value={selectedOption}
        onChange={handleOnchange}
      >
        <option value='' disabled>
          --- {label} ---
        </option>
        {options &&
          options.map((option) => (
            <option className={optionClass} key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
      </select>
    </label>
  );
};

export default Select;
