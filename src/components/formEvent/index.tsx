import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CREATE_BOOKING, GET_BOOKING, UPDATE_BOOKING } from "../../api/booking/query";
import { GET_OFFICES } from "../../api/office/query";
import { GET_AVAILBLE_ROOM } from "../../api/room/query";
import { TOAST_FORM_ID } from "../../constants/toastId";
//import useBookingStore from "../../store/bookingStore";
import { IFormData, IFormEvent } from "../../types/interfaces/event";
import FormEvent from "./form";
import { useParams } from "react-router-dom";

interface IFormEventComponent {
  clickedDate: string;
  onRefetchBookings: () => void;
}

const FormEventComponent = ({ clickedDate, onRefetchBookings }: IFormEventComponent) => {
  const { id: bookingId } = useParams();
  const [isDataEdit, setIsDataEdit] = useState<boolean>(!!bookingId);
  //const { bookingId, clearBookingId } = useBookingStore();
  //const [ isDataEdit, setIsDataEdit] = useState<boolean>(false);
  const { data: officesData } = useQuery(GET_OFFICES);
  const [CreateBooking] = useMutation(CREATE_BOOKING, {
    errorPolicy: "all"
  });
  const [UpdateBooking] = useMutation(UPDATE_BOOKING, {
    errorPolicy: "all"
  });
  const [getAvailableRooms, { data: availableRoomsData }] = useLazyQuery(GET_AVAILBLE_ROOM);
  const [getBooking, { data: bookingData }] = useLazyQuery(GET_BOOKING);

  useEffect(() => {
    if (bookingId) {
      getBooking({ variables: { bookingID: bookingId }, fetchPolicy: "network-only" });
    }
  }, [bookingId, getBooking]);

  useEffect(() => {
    if (bookingId) {
      setIsDataEdit(true);
    } else {
      setIsDataEdit(false);
    }
  }, [bookingId]);

  const handleGetFormData = (data: IFormData, getSelectedOfficeId: string) => {
    if (!data.reservationDay) return;

    getAvailableRooms({
      variables: {
        input: {
          officeId: data.officeId || getSelectedOfficeId,
          startDate: data.reservationDay || null,
          startTime: data.startTime || "09:00",
          endTime: data.endTime || null,
          isRepeat: data.isRepeat,
          endDate: data.endDate || null
        }
      },
      fetchPolicy: "network-only"
    });
  };

  const handlePostEvent = async (data: IFormEvent): Promise<boolean> => {
    if (!isDataEdit) {
      const { data: resData, errors } = await CreateBooking({
        variables: {
          input: {
            title: data.title,
            roomId: data.roomId,
            officeId: data.officeId,
            isRepeat: data.isRepeat,
            startDate: data.startDate,
            endDate: data.endDate
          }
        }
      });

      if (resData) {
        toast.success(resData.CreateBooking.message, { toastId: TOAST_FORM_ID.SUCCESS });
        onRefetchBookings();

        return true;
      }

      if (errors) {
        toast.warn(errors && errors[0].message, { toastId: TOAST_FORM_ID.ERROR });
      }

      return false;
    } else {
      const { data: resData, errors } = await UpdateBooking({
        variables: {
          input: {
            id: bookingId,
            title: data.title,
            roomId: data.roomId,
            officeId: data.officeId,
            isRepeat: data.isRepeat,
            startDate: data.startDate,
            endDate: data.endDate
          }
        }
      });

      if (resData) {
        toast.success(resData.UpdateBooking.message, { toastId: TOAST_FORM_ID.SUCCESS });
        onRefetchBookings();
        handleCancelEdit();
        return true;
      }

      if (errors) {
        toast.warn(errors && errors[0].message, { toastId: TOAST_FORM_ID.ERROR });
      }
      return false;
    }
  };

  const handleCancelEdit = () => {
    setIsDataEdit(false);
  };

  return (
    <div className='w-full md:w-[33%] mr-[10px] md:mx-[16px] mb-10'>
      <FormEvent
        clickedDate={clickedDate}
        offices={officesData?.GetOffices}
        rooms={availableRoomsData?.GetAvailableRooms}
        onSubmit={handlePostEvent}
        isEdit={isDataEdit}
        onCancelEdit={handleCancelEdit}
        dataEdit={bookingData?.GetBooking || null}
        getFormData={handleGetFormData}
      />
    </div>
  );
};

export default FormEventComponent;
