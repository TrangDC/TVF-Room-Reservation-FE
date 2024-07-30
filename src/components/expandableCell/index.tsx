import { GridRenderCellParams } from "@mui/x-data-grid";
import React from "react";

function ExpandableCell({ value }: GridRenderCellParams) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className='text-base p-3 break-words w-full'>
      <span
        style={{
          whiteSpace: "pre-wrap"
        }}
      >
        {expanded ? value : value?.toString().slice(0, 80)}
      </span>
      {value?.length > 80 && (
        <span
          className='cursor-pointer text-xs underline text-primary-blue'
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <span className='ms-1'>Thu gọn</span>
          ) : (
            <span className=''>&#8230;Xem thêm</span>
          )}
        </span>
      )}
    </div>
  );
}

export default ExpandableCell;
