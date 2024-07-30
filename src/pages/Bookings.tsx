import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { TiEdit } from "react-icons/ti";
import { GET_OFFICES } from "../api/office/query";
import { IOfficeApi } from "../api/office/type";
import Modal from "../components/common/modal";
import Select from "../components/common/select";
import Loading from "../components/loading";
import Pagination, { IPaginationProps } from "../components/pagination";
import useBookingStore from "../store/bookingStore";
import { IBookingAPI } from "../api/booking/type";
import { DELETE_BOOKING, GET_BOOKINGS } from "../api/booking/query";
import { Link } from "react-router-dom";
//import { IFormEvent } from "../types/interfaces/event";
import { localStorageHelper } from "../utils/localStorage";
import { useDebounce } from "../hooks/useDebounce";
import { toast } from "react-toastify";
import { TOAST_FORM_ID } from "../constants/toastId";
import { TextField } from "@mui/material";

function Bookings() {
  const [getBookings, { data: bookings, refetch: bookingsRefetch, loading }] =
    useLazyQuery(GET_BOOKINGS);
  const [CancelBooking] = useMutation(DELETE_BOOKING);
  const [rows, setRows] = useState<IBookingAPI[]>([]);
  const [isShowModal, setIsShowModal] = useState(false);
  const [idDelete, setIdDelete] = useState<string>("");
  const [pagination, setPagination] = useState<IPaginationProps | null>(null);
  const [selectedOffice, setSelectedOffice] = useState<string>("");
  const [selectOptions, setSelectOptions] = useState<IOfficeApi[]>();
  const { data: officesData } = useQuery<{ GetOffices: IOfficeApi[] }>(GET_OFFICES);
  const [filterForm, setFilterForm] = useState<string>("");
  const [totalMeeting, setTotalMeeting] = useState<number>(12);
  const { bookingId, setBookingId, clearBookingId } = useBookingStore();
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const [startDate, setStartDate] = useState<string>(startOfMonth.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState<string>(endOfMonth.toISOString().split("T")[0]);
  // const [currentPage, setCurrentPage] = useState<number>(1);

  const getSelectOffice =
    localStorageHelper.get<string>(
      localStorageHelper.LOCAL_STORAGE_KEYS.CALENDAR_SELECT_OFFICEID
    ) || "";
  useEffect(() => {
    if (officesData) {
      handleSelectOfficeSorting(getSelectOffice || officesData.GetOffices[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [officesData]);

  useEffect(() => {
    const newOfficesData: IOfficeApi[] =
      officesData?.GetOffices.map((office) => ({
        id: office.id,
        name: office.name,
        description: office.description,
        rooms: office.rooms
      })) ?? [];

    setSelectOptions(newOfficesData);
  }, [officesData]);

  const handleSelectOfficeSorting = (officeId: string) => {
    if (!officeId) return;
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];
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
          officeId: officeId
        },
        pagination: {
          page: 1,
          perPage: 12
        }
      }
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "startDate") {
      setStartDate(value);
    } else if (name === "endDate") {
      setEndDate(value);
    }
    if (selectedOffice) {
      getBookings({
        variables: {
          filter: {
            startDate: name === "startDate" ? value : startDate,
            endDate: name === "endDate" ? value : endDate,
            officeId: selectedOffice
          },
          pagination: {
            page: 1,
            perPage: 12
          }
        }
      });
    }
  };

  const columns: GridColDef[] = [
    { field: "event_name", headerName: "Event Name", flex: 2, minWidth: 300 },
    { field: "officeName", headerName: "Office Name", flex: 1, minWidth: 150 },
    { field: "roomName", headerName: "Room Name", flex: 1, minWidth: 150 },
    { field: "dateStart", headerName: "Start Date", flex: 1, minWidth: 150 },
    { field: "dateEnd", headerName: "End Date", flex: 1, minWidth: 150 },
    { field: "time", headerName: "Time", flex: 1, minWidth: 150 },
    { field: "email", headerName: "Email", flex: 1, minWidth: 150 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <div className='flex flex-row items-center'>
          {/* <Link to='/' target='_blank' rel='noopener noreferrer'> */}
          <Link rel='noopener noreferrer' target='_blank' to={`/edit/${params.row.id}`}>
            <TiEdit
              className='pr-[10px] py-[8px] mr-[4px] text-[42px] text-[#07a53b]'
              onClick={() => handleEdit(params.row)}
            />
          </Link>
          <RiDeleteBin6Line
            className='px-[10px] py-[8px] text-[40px] text-[#ff1515]'
            onClick={() => handleDelete(params.row)}
          />
        </div>
      )
    }
  ];

  const handleSetPage = (page: number) => {
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
          endDate,
          officeId: selectedOffice
        },
        pagination: {
          page: page ? page : 1,
          perPage: 12
        }
      }
    });
  };

  const handleEdit = (booking: IBookingAPI) => {
    setBookingId(booking.id);
    // const formEvent: IFormEvent = {
    //   title: booking.title,
    //   officeId: booking.office.id,
    //   roomId: booking.room ? booking.room.id : "",
    //   startDate: booking.startDate.toISOString().split("T")[0],
    //   endDate: booking.endDate ? booking.endDate.toISOString().split("T")[0] : "",
    //   isRepeat: booking.isRepeat ? true : false
    // };

    // setBookingDetails(formEvent);
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

  if (loading) <Loading />;

  useEffect(() => {
    if (bookings) {
      setTotalMeeting(bookings.GetBookings.total);
      const pages = totalMeeting % 12 === 0 ? totalMeeting / 12 : Math.floor(totalMeeting / 12) + 1;
      setPagination({
        pages: pages,
        total: totalMeeting,
        pageSize: 12,
        handleSetPage: handleSetPage
      });
      setRows(
        bookings.GetBookings.data.map((booking: IBookingAPI) => {
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
          };
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, bookingsRefetch, totalMeeting]);

  const handleFilterForm = () => {
    getBookings({
      variables: {
        filter: {
          startDate,
          endDate,
          officeId: selectedOffice,
          keyword: filterForm
        },
        pagination: {
          page: 1,
          perPage: 12
        }
      }
    });
  };
  const debouceFormData = useDebounce(handleFilterForm, 300);

  useEffect(() => {
    if (selectedOffice) {
      debouceFormData();
    }
  }, [filterForm, selectedOffice, startDate, endDate]);

  const handleModalConfirmCancel = () => {
    setIsShowModal(false);
  };

  const handleModalConfirmDelete = async () => {
    setIsShowModal(false);
    const { data: resData, errors } = await CancelBooking({
      variables: {
        bookingID: idDelete
      }
    });

    if (totalMeeting % 12 === 1) {
      handleSetPage(1);
    }
    if (errors) {
      toast.warn(errors && errors[0].message, { toastId: TOAST_FORM_ID.ERROR });
    }

    if (resData) {
      if (bookingId === idDelete) {
        clearBookingId();
        localStorageHelper.remove(localStorageHelper.LOCAL_STORAGE_KEYS.FORM_DATA);
      }
      await bookingsRefetch();
      toast.success("Delete event success!");
    }
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
        <div className='flex flex-row w-full items-center md:justify-between mb-2'>
          <div className='flex flex-col md:flex-row justify-center items-start md:items-center'>
            {selectOptions && selectOptions.length > 0 && (
              <Select
                containerClass='flex flex-row items-center mr-5 mb-[20px] md:mb-0'
                labelClass='mr-5 text-lg text-black'
                selectClass='!text-[16px] py-[9px] px-[1px] cursor-pointer w-[130px] h-[41px]'
                // options={officesData}
                options={selectOptions}
                onSelectOption={handleSelectOfficeSorting}
                label='Office'
                defaultValue={selectedOffice}
              />
            )}
            <div className='flex w-full items-center justify-start'>
              <TextField
                value={filterForm}
                label='Search'
                onChange={(e) => setFilterForm(e.target.value)}
                size='small'
              />
              <label className='mx-3 font-[500] text-sm text-black items-center'>Date</label>
              <TextField
                type='date'
                name='startDate'
                value={startDate}
                onChange={handleDateChange}
                label='Start Date'
                title='Start Date'
                size='small'
              />
              <label className='mx-4 font-[500] text-sm text-black items-center'>-</label>
              <TextField
                type='date'
                name='endDate'
                label='End Date'
                value={endDate}
                onChange={handleDateChange}
                size='small'
              />
            </div>
          </div>
        </div>
        <div style={{ height: 710, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            // slots={{ toolbar: GridToolbar }}
            hideFooterPagination={true}
            hideFooter={true}
          />
        </div>
        <Pagination data={pagination} />
      </div>
    </div>
  );
}

export default Bookings;
