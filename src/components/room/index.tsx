import Tippy from "@tippyjs/react";
import React from "react";

interface RoomInfoProps {
  name: string;
  id: string;
  selectedId: string | undefined;
  description: string;
  image: string;
  color: string;
  status: boolean;
  onClick?: (id: string) => void;
}

const RoomInfo: React.FC<RoomInfoProps> = ({
  name,
  description,
  image,
  id,
  selectedId = "",
  color,
  status,
  onClick
}) => {
  return (
    <Tippy
      interactive={false}
      placement='top'
      theme='light'
      content={
        <div className='cursor-default p-3'>
          <div className='flex flex-col mb-2'>
            <div className='!font-semibold text-xl mb-5'>{name}</div>
            <div className='font-medium whitespace-break-spaces'>
              {description.replace(/\\n/g, "\n")}
              {/* Xử lí sau */}
            </div>
          </div>
        </div>
      }
    >
      <div
        key={id}
        className={`col-span-3 md:col-span-3 2xl:col-span-1 xl:col-span-3 relative shadow-2xl ${status && selectedId === id ? " border-[#9bbcff] border-[6px]" : "border-transparent"} cursor-pointer`}
        onClick={() => {
          onClick && onClick(id);
        }}
      >
        <div className='group room-info cursor-pointer relative overflow-hidden pointer-events-auto h-full'>
          <div
            className='absolute top-0 left-0 h-full w-2 z-10'
            style={{
              backgroundColor: color
            }}
          ></div>

          <div
            className={`bg-info w-full h-full opacity-75 bg-gradient-to-b from-transparent to-[#000] z-0 absolute`}
          ></div>
          <img
            src={
              `${image}` ||
              "https://careers.techvify.com.vn/wp-content/uploads/2022/03/techvify-logo-blue.png"
            }
            alt='No branch selected'
            className='w-full md:h-full object-center'
          />
          <span className='font-bold mx-4 text-[#fff] absolute bottom-3.5'>{name}</span>
          {status ? (
            <span className='m-2 p-1 text-xs text-white font-bold absolute top-0 right-0 bg-[#1DBA81] rounded-md'>
              Available
            </span>
          ) : (
            <span className='m-2 p-1 text-xs text-white font-bold absolute top-0 right-0 bg-[#E94C4C] rounded-md'>
              Unavailable
            </span>
          )}
        </div>
      </div>
    </Tippy>
  );
};

export default RoomInfo;
