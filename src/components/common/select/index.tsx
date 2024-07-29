import { ChangeEvent, SelectHTMLAttributes, useEffect, useState } from "react";
import { IOfficeApi } from "../../../api/office/type";

interface ISelect extends SelectHTMLAttributes<HTMLSelectElement> {
  selectClass?: string;
  optionClass?: string;
  containerClass?: string;
  labelClass?: string;
  label?: string;
  options?: IOfficeApi[];
  onSelectOption: (e: string) => void;
  defaultValue: string | undefined;
}

const Select = ({
  onSelectOption,
  selectClass,
  optionClass,
  labelClass,
  containerClass,
  name,
  options,
  defaultValue,
  label = "select"
}: ISelect) => {
  const [selectedOption, setSelectedOption] = useState<string | undefined>("");
  useEffect(() => {
    setSelectedOption(defaultValue)
  }, [defaultValue])

  const handleOnchange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e.target.value);
    onSelectOption && onSelectOption(e.target.value);
  };
  return (
    <label
      htmlFor='form'
      className={containerClass + " block mb-2 text-sm font-medium text-gray-900"}
    >
      <span className={labelClass}>{label}:</span>
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
