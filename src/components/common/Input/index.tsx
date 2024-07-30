import { requirePropFactory } from "@mui/material";
import {
  ChangeEvent,
  InputHTMLAttributes,
  Ref,
  RefAttributes,
  TextareaHTMLAttributes,
  forwardRef,
  useEffect,
  useState
} from "react";

interface InputFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, keyof RefAttributes<HTMLInputElement>> {
  label: string;
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  value?: string;
  forwardRef?: Ref<HTMLInputElement>;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, id, type, onChange, value = "", required = false, ...props }, ref) => {
    const [inputValue, setInputValue] = useState<string>("");
    useEffect(() => {
      setInputValue(value as string);
    }, [value]);

    const handleInputOnchange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      // setInputValue(target.value);
      onChange && onChange(e);
    };

    return (
      <div className='relative z-0 w-full mb-5 group'>
        {type === "textarea" ? (
          <>
            <label htmlFor='title' className='text-gray-500'>
              {label} {required && <span className='text-xl text-red-500'>*</span>}
            </label>
            <textarea
              className=' block py-2.5 px-0 w-full text-[16px] font-[500] cursor-pointer text-[#000000] bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:border-gray-600  focus:outline-none peer'
              onChange={handleInputOnchange}
              placeholder={`Enter ${label}`}
              rows={3}
              value={inputValue}
              {...(props as Omit<
                TextareaHTMLAttributes<HTMLTextAreaElement>,
                keyof InputFieldProps
              >)}
            />
          </>
        ) : (
          <>
            <input
              ref={ref}
              className=' block py-2.5 px-0 w-full text-[16px] font-[500] cursor-pointer text-[#000000] bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:border-gray-600  focus:outline-none peer'
              type={type}
              onChange={handleInputOnchange}
              value={inputValue}
              {...props}
            />

            <label
              htmlFor={id}
              className=' peer-focus:font-medium absolute text-[1rem] text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'
            >
              {label} {required && <span className='text-xl text-red-500'>*</span>}
            </label>
          </>
        )}
      </div>
    );
  }
);

export default InputField;
