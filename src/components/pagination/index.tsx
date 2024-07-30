import { CaretLeftOutlined, CaretRightOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

export interface IPaginationProps {
  pages: number;
  total: number;
  pageSize: number;
  handleSetPage: (page: number) => void;
}

export default function Pagination({ data }: { data: IPaginationProps | null }) {
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    if (!data) setPage(1);
  }, [data]);

  if (data?.pages === 1 || data?.pages === 0) return "";

  return (
    <div className='flex items-center justify-center border-t border-gray-200 bg-white px-4 py-3 sm:px-6'>
      <div className='hidden sm:flex sm:flex-1 sm:items-center sm:justify-center'>
        <div>
          <nav
            aria-label='Pagination'
            className='isolate inline-flex -space-x-px rounded-md shadow-sm items-center justify-center'
          >
            {data?.pages && data.pages >= 2 && (
              <CaretLeftOutlined
                aria-hidden='true'
                className='h-7 w-8 justify-center'
                onClick={() => {
                  if (data?.pages) {
                    if (page > 1) {
                      data?.handleSetPage(page - 1);
                      setPage(page - 1);
                    }
                  }
                }}
              />
            )}
            {Array.from({ length: data?.pages || 0 }, (_, i) => (
              <button
                key={i}
                aria-current={i === 0 ? "page" : undefined}
                onClick={() => {
                  data?.handleSetPage(i + 1);
                  setPage(i + 1);
                }}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                  i === page - 1
                    ? "z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                }`}
              >
                {i + 1}
              </button>
            ))}

            {data?.pages && data?.pages > 5 && (
              <span className='relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0'>
                ...
              </span>
            )}
            {data?.pages && data.pages >= 2 && (
              <CaretRightOutlined
                aria-hidden='true'
                className='h-7 w-8 justify-center'
                onClick={() => {
                  if (data?.pages) {
                    if (page < data.pages) {
                      data?.handleSetPage(page + 1);
                      setPage(page + 1);
                    }
                  }
                }}
              />
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
