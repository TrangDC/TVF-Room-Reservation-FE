import { useLazyQuery, useMutation } from "@apollo/client";
import { useState } from "react";
import { toast } from "react-toastify";
import { DELETE_BOOKING, GET_BOOKING, GET_BOOKINGS } from "../api/booking/query";
import { USER_ROLE } from "../constants/role";
import useUserStore from "../store/store";
import { localStorageHelper } from "../utils/localStorage";
import CalendarComponent from "./calendar/index";
import Modal from "./common/modal";
import FormEventComponent from "./formEvent";

function Content() {
  const [isShowModal, setIsShowModal] = useState(false);
  const [clickedDate, setClickedDate] = useState<string>("");
  const { role } = useUserStore((state) => state.user);
  const [GetBooking] = useLazyQuery(GET_BOOKING);
  const [CancelBooking] = useMutation(DELETE_BOOKING);
  const [idDelete, setIdDelete] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(
    localStorageHelper.get(localStorageHelper.LOCAL_STORAGE_KEYS.START_DATE) || ""
  );
  const [endDate, setEndDate] = useState<string>(
    localStorageHelper.get(localStorageHelper.LOCAL_STORAGE_KEYS.END_DATE) || ""
  );
  const [selectedOffice, setSelectedOffice] = useState<string>(
    localStorageHelper.get(localStorageHelper.LOCAL_STORAGE_KEYS.CALENDAR_SELECT_OFFICEID) || ""
  );
  const [getBookings, { data: bookings }] = useLazyQuery(GET_BOOKINGS);

  const handleSelectOfficeSorting = (officeId: string) => {
    localStorageHelper.set(
      localStorageHelper.LOCAL_STORAGE_KEYS.CALENDAR_SELECT_OFFICEID,
      officeId
    );
    setSelectedOffice(officeId);
    getBookings({
      variables: {
        filter: {
          startDate,
          endDate,
          officeId: selectedOffice
        }
      },
      fetchPolicy: "network-only"
    });
  };

  const handleDatesSet = (startDate: string, endDate: string) => {
    setStartDate(startDate);
    setEndDate(endDate);
    localStorageHelper.set(localStorageHelper.LOCAL_STORAGE_KEYS.START_DATE, startDate);
    localStorageHelper.set(localStorageHelper.LOCAL_STORAGE_KEYS.END_DATE, endDate);
    handleRefetchBookings();
  };

  const handleRefetchBookings = () => {
    if (!startDate && !endDate && !selectedOffice) return;

    getBookings({
      variables: {
        filter: {
          startDate,
          endDate,
          officeId: selectedOffice
        }
      },
      fetchPolicy: "network-only"
    });
  };

  const handleModalConfirmCancel = () => {
    setIsShowModal(false);
  };

  const handleModalConfirmDelete = async () => {
    await CancelBooking({
      variables: {
        bookingID: idDelete
      }
    });
    setIsShowModal(false);
    toast.success("Delete event success!");
  };

  const handleEditBooking = (id: string) => {
    GetBooking({
      variables: {
        bookingID: id
      }
    });
  };

  const handleDeleteBooking = (id: string) => {
    setIsShowModal(true);
    setIdDelete(id);
  };

  const handleClickedDate = (date: string) => {
    setClickedDate(date);
  };

  return (
    <>
      <Modal
        onClickCancel={handleModalConfirmCancel}
        onClickDelete={handleModalConfirmDelete}
        isShow={isShowModal}
      />
      <div className='home-container w-full flex flex-col items-center justify-center mb-8 md:mb-0'>
        <div className='home-wrapper w-[90%] flex flex-col-reverse md:flex-row justify-center'>
          {(role === USER_ROLE.ADMINISTRATOR || role === USER_ROLE.SUPER_ADMIN) && (
            <FormEventComponent
              clickedDate={clickedDate}
              onRefetchBookings={handleRefetchBookings}
            />
          )}
          <div className='calendar-container w-full md:w-[66%] md:ml-[10px]'>
            <CalendarComponent
              onClickDate={handleClickedDate}
              onEditBooking={handleEditBooking}
              onDeleteBooking={handleDeleteBooking}
              selectedOffice={selectedOffice}
              bookings={bookings}
              handleSelectOfficeSorting={handleSelectOfficeSorting}
              onDatesSet={handleDatesSet}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Content;
