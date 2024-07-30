import { useLazyQuery, useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { DELETE_BOOKING, GET_BOOKING, GET_BOOKINGS } from "../api/booking/query";
import { USER_ROLE } from "../constants/role";
import useBookingStore from "../store/bookingStore";
import useUserStore from "../store/store";
import { IDateRange } from "../types/interfaces/booking";
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
  const { officeId, setDateRange } = useBookingStore();
  const [dateRangeData, setDateRangeData] = useState<IDateRange>({
    startDate: "",
    endDate: ""
  });
  const [getBookings, { data: bookings }] = useLazyQuery(GET_BOOKINGS);

  useEffect(() => {
    handleRefetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRangeData, officeId]);

  const handleDatesSet = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
    setDateRangeData({ startDate, endDate });
  };

  const handleRefetchBookings = () => {
    if (!dateRangeData.startDate && !dateRangeData.endDate && !officeId) return;

    getBookings({
      variables: {
        filter: {
          startDate: dateRangeData.startDate,
          endDate: dateRangeData.endDate,
          officeId: officeId
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
    handleRefetchBookings();
    setIsShowModal(false);
    toast.success("Delete event success!");
  };

  const handleEditBooking = (id: string) => {
    GetBooking({
      variables: {
        bookingID: id
      },
      fetchPolicy: "network-only"
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
          <FormEventComponent clickedDate={clickedDate} onRefetchBookings={handleRefetchBookings} />
          <CalendarComponent
            onClickDate={handleClickedDate}
            onEditBooking={handleEditBooking}
            onDeleteBooking={handleDeleteBooking}
            bookings={bookings?.GetBookings?.data}
            onDatesSet={handleDatesSet}
          />
        </div>
      </div>
    </>
  );
}

export default Content;
