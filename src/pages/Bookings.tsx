import { useLazyQuery, useMutation } from "@apollo/client";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { TiEdit } from "react-icons/ti";
import { useNavigate } from "react-router-dom";
//import { localStorageHelper } from "../utils/localStorage";
//import { IFormData } from "../types/interfaces/event";
import Modal from "../components/common/modal";
import { toast } from "react-toastify";
import useBookingStore from "../store/bookingStore";
import { IBookingAPI } from "../api/booking/type";
import { DELETE_BOOKING, GET_BOOKINGS } from "../api/booking/query";
function Bookings() {
  const navigate = useNavigate();
  const [getBookings, { data: bookings, refetch: bookingsRefetch }] = useLazyQuery(GET_BOOKINGS);
  const [CancelBooking] = useMutation(DELETE_BOOKING);
  const [rows, setRows] = useState<IBookingAPI[]>([]);
  const [isShowModal, setIsShowModal] = useState(false);
  const [idDelete, setIdDelete] = useState<string>("");
  const { setBookingId } = useBookingStore();
  const columns: GridColDef[] = [
    { field: "event_name", headerName: "Event Name", width: 200 },
    { field: "officeName", headerName: "Office Name", width: 150 },
    { field: "roomName", headerName: "Room Name", width: 150 },
    { field: "dateStart", headerName: "Start Date", width: 150 },
    { field: "dateEnd", headerName: "End Date", width: 150 },
    { field: "time", headerName: "Time", width: 150 },
    { field: "email", headerName: "Email", width: 300 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <div className='flex flex-row items-center'>
          <TiEdit
            className='pr-[10px] py-[8px] mr-[4px] text-[42px] text-[#07a53b]'
            onClick={() => handleEdit(params.row)}
          />
          <RiDeleteBin6Line
            className='px-[10px] py-[8px] text-[40px] text-[#ff1515]'
            onClick={() => handleDelete(params.row)}
          />
        </div>
      )
    }
  ];

  const handleEdit = (booking: IBookingAPI) => {
    navigate("/", { state: { booking } });
    setBookingId(booking.id);
  };

  const handleDelete = (row: IBookingAPI) => {
    setIsShowModal(true);
    setIdDelete(row.id);
  };

  const formatTime = (startDate: Date, endDate?: Date) => {
    const formatToHHMM = (date: Date) => date.toISOString().split("T")[1].slice(0, 5);
    const startTime = formatToHHMM(startDate);
    if (endDate) {
      const endTime = formatToHHMM(endDate);
      return `${startTime} - ${endTime}`;
    }
    return startTime;
  };

  useEffect(() => {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];

    getBookings({
      variables: {
        filter: {
          startDate,
          endDate
        }
      }
    });
  }, [getBookings]);

  useEffect(() => {
    if (bookings) {
      setRows(
        bookings.GetBookings.map((booking: IBookingAPI) => {
          const startDate = new Date(booking.startDate);
          const endDate = booking.endDate ? new Date(booking.endDate) : undefined;
          return {
            id: booking.id,
            event_name: booking.title,
            officeName: booking.office.name,
            roomName: booking.room?.name || "Oops! 😳 ",
            dateStart: startDate.toISOString().split("T")[0],
            dateEnd: endDate ? endDate.toISOString().split("T")[0] : "",
            time: formatTime(startDate, endDate),
            email: booking.user.workEmail
            // roomiD: booking.room.id
          };
        })
      );
    }
  }, [bookings]);

  const handleModalConfirmCancel = () => {
    setIsShowModal(false);
  };

  const handleModalConfirmDelete = async () => {
    setIsShowModal(true);
    await CancelBooking({
      variables: {
        bookingID: idDelete
      }
    });
    bookingsRefetch();
    toast.success("Delete event success!");
  };

  return (
    <div className='w-full flex flex-col justify-center items-center'>
      <Modal
        onClickCancel={handleModalConfirmCancel}
        onClickDelete={handleModalConfirmDelete}
        isShow={isShowModal}
      />
      <div className='w-[90%] mt-[60px]'>
        <p className='mb-[10px] font-bold text-[#0d73d3] text-[20px]'>All Meetings</p>
        <div style={{ height: 800, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            slots={{ toolbar: GridToolbar }}
            hideFooterPagination={true}
          />
        </div>
      </div>
    </div>
  );
}

export default Bookings;
