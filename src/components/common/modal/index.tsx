import { useEffect, useState } from "react";
import CautionSvg from "../../../assets/svg/caution.svg";
import Button from "../button/button";
import { Dialog } from "@mui/material";

interface IModal {
  isShow?: boolean;
  textDelete?: string;
  onClickCancel?: () => void;
  onClickDelete?: () => void;
}

const Modal = ({ onClickCancel, onClickDelete, textDelete = "Delete", isShow = false }: IModal) => {
  const [isShowModal, setIsShowModal] = useState<boolean>(false);

  useEffect(() => {
    setIsShowModal(isShow);
  }, [isShow]);

  const handleClickCancel = () => {
    setIsShowModal(false);
    onClickCancel && onClickCancel();
  };

  const handleOnClickDelete = async () => {
    onClickDelete && onClickDelete();
    setIsShowModal(false);
  };

  return (
    <Dialog
      open={isShowModal}
      // className='z-50 flex items-center justify-center h-screen w-screen fixed top-0 bg-black bg-opacity-60'
    >
      <div className='relative  bg-white  w-[26rem] rounded-md'>
        <div className='p-3 flex items-center justify-between border-b border-b-gray-300'>
          <h3 className='flex-1 font-semibold text-2xl text-warning text-center'>Warning</h3>
        </div>
        <div className='py-3 flex flex-col items-center p-3 border-b border-b-gray-300'>
          <img className='w-16 h-16 mt-5 mb-4' src={CautionSvg} alt='caution' />
          <p className='mb-5 font-semibold text-xl'>Are you sure!</p>
        </div>
        <div className='p-3 flex items-center justify-end'>
          <div className='flex flex-1 gap-4 items-center justify-center'>
            <Button
              onClick={handleClickCancel}
              className='modal-close text-sm !text-black border rounded-md px-4 py-2 bg-white'
            >
              Cancel
            </Button>
            <Button
              onClick={handleOnClickDelete}
              className='text-sm text-white rounded-md px-4 py-2 bg-warning'
            >
              {textDelete}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default Modal;
