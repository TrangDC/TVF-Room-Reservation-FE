import { useLazyQuery, useQuery } from "@apollo/client";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import Tippy from "@tippyjs/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import { GET_BOOKINGS } from "../../api/booking/query";
import { IBookingAPI } from "../../api/booking/type";
import { GET_OFFICES } from "../../api/office/query";
import { IOfficeApi } from "../../api/office/type";
import { TOAST_CALENDAR_ID } from "../../constants/toastId";
import useBookingStore from "../../store/bookingStore";
import { IExtendedProps } from "../../types/interfaces/calendar";
import { IEvent } from "../../types/interfaces/event";
import { localStorageHelper } from "../../utils/localStorage";
import { dateToStringTime } from "../../utils/timeFormat";
import Button from "../common/button/button";
import Modal from "../common/modal";
import Select from "../common/select";
import "./index.scss";
import useUserStore from "../../store/store";

interface CalendarComponentProps {
  events?: IEvent[];
  initialView?: string;
  weekends?: boolean;
  height?: string;
  onClickDate: (date: string) => void;
  onEditBooking?: (id: string) => void;
  onDeleteBooking: (id: string) => void;
  selectedOffice: string;
  bookings: [];
  handleSelectOfficeSorting: (officeId: string) => void;
  onDatesSet: (startDate: string, endDate: string) => void;
}

interface ICalendarEvent extends IEvent {
  extendedProps: IExtendedProps;
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({
  events,
  initialView = "dayGridMonth",
  //onEditBooking,
  onDeleteBooking,
  onClickDate,
  weekends = true,
  height = "80vh",
  onDatesSet
}) => {
  const user = useUserStore((state) => state.user);
  const getSelectOffice =
    localStorageHelper.get<string>(
      localStorageHelper.LOCAL_STORAGE_KEYS.CALENDAR_SELECT_OFFICEID
    ) || "";
  const [selectedOffice, setSelectedOffice] = useState<string>("");
  const [selectOptions, setSelectOptions] = useState<IOfficeApi[]>();
  const { data: officesData } = useQuery<{ GetOffices: IOfficeApi[] }>(GET_OFFICES);
  const [getBookings, { data: bookings }] = useLazyQuery(GET_BOOKINGS);
  const calendarRef = useRef<FullCalendar>(null); // Ref to FullCalendar instance
  const [startDate, setStartDate] = useState<string>(""); // State to hold startDate
  const [endDate, setEndDate] = useState<string>(""); // State to hold endDate
  const { setBookingId } = useBookingStore();

  // useEffect(() => {
  //   if (
  //     (officeError?.networkError instanceof Error &&
  //       (officeError?.networkError as Error).message.includes("401")) ||
  //     (bookingError?.networkError instanceof Error &&
  //       (bookingError?.networkError as Error).message.includes("401"))
  //   ) {
  //     toast.warn("Session expired please sign in again!", {
  //       toastId: TOAST_TOKEN.EXPIRED
  //     });
  //   }
  // }, [officeError, bookingError]);

  // const handleDatesSet = (arg: { start: Date; end: Date }) => {
  //   setStartDate(arg.start.toISOString().split("T")[0]);
  //   setEndDate(arg.end.toISOString().split("T")[0]);
  //   onDatesSet(startDate, endDate);
  // };

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
    if (!startDate && !endDate && !officeId) return;

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
          officeId
        }
      }
    });
  };

  const handleDatesSet = (arg: { start: Date; end: Date }) => {
    const getStartDate = arg.start.toISOString().split("T")[0];
    const getEndDate = arg.end.toISOString().split("T")[0];
    setStartDate(getStartDate);
    setEndDate(getEndDate);
    localStorageHelper.set(localStorageHelper.LOCAL_STORAGE_KEYS.START_DATE, getStartDate);
    localStorageHelper.set(localStorageHelper.LOCAL_STORAGE_KEYS.END_DATE, getEndDate);
    onDatesSet(getStartDate, getEndDate);
    handleSelectOfficeSorting(selectedOffice);
  };

  if (bookings) {
    events = bookings.GetBookings.map((booking: IBookingAPI) => {
      const startRecur = new Date(`${booking.startDate}`);
      const endRecur = new Date(`${booking.endDate}`);

      const getFormattedTime = (date: Date): string => {
        const hours = date.getUTCHours().toString().padStart(2, "0");
        const minutes = date.getUTCMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
      };
      const startTime = getFormattedTime(startRecur);
      const endTime = getFormattedTime(endRecur);

      return {
        id: booking.id,
        title: booking.title,
        start: startRecur,
        end: endRecur,
        name: booking.room?.name,
        floor: booking.room?.floor,
        backgroundColor: booking.room?.color,
        branchID: booking.office.id,
        roomID: booking.room?.id,
        startTime: startTime,
        endTime: endTime,
        dateStart: booking.startDate,
        dateEnd: booking.endDate,
        creatorEmail: booking.user.workEmail,
        isRepeat: booking.isRepeat,
        startRecur: startRecur,
        endRecur: endRecur,
        daysOfWeek: ["1", "2", "3", "4", "5"]
      };
    });
  }

  const handleDateClick = (info: { dateStr: string }) => {
    const clickedDate = info.dateStr;
    const now = new Date();
    const year = now.getFullYear();
    const month = ("0" + (now.getMonth() + 1)).slice(-2);
    const day = ("0" + now.getDate()).slice(-2);

    const currentDate = `${year}-${month}-${day}`;
    if (clickedDate) {
      if (currentDate <= clickedDate) {
        if (calendarRef.current) {
          const calendarApi = calendarRef.current.getApi();
          calendarApi.changeView("timeGridDay", clickedDate);
        }
        onClickDate && onClickDate(clickedDate);
      } else {
        toast.warn("Can't select the past!", {
          toastId: TOAST_CALENDAR_ID.SELECTED_PAST_DATE
        });
      }
    }
  };

  const handleOnClickEditBtn = (id: string) => {
    setBookingId(id);
  };

  const handleOnClickDeleteBtn = (id: string) => {
    onDeleteBooking && onDeleteBooking(id);
  };

  function renderEventContent(eventInfo: { event: ICalendarEvent }) {
    const { title, backgroundColor, start, end, id } = eventInfo.event;

    const { name, floor, creatorEmail } = eventInfo.event.extendedProps;

    const startTime = dateToStringTime(start);
    const endTime = dateToStringTime(end);
    return (
      <Tippy
        interactive={true}
        placement='top'
        theme='light'
        content={
          <div className='cursor-default text-nowrap p-3'>
            <div className='flex flex-col mb-2'>
              <div className='!font-semibold text-xl'>{title}</div>
              <div className='!font-medium my-1'>
                {name}, {floor}
              </div>
              <div className='flex !font-medium '>
                {startTime} - {endTime}
              </div>
            </div>

            <div className='flex'>
              {user?.email === creatorEmail ? (
                <div className='flex'>
                  <Button
                    onClick={() => {
                      handleOnClickEditBtn(id);
                    }}
                    className='!text-md !px-2 !py-[1px] mr-2'
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => {
                      handleOnClickDeleteBtn(id);
                    }}
                    className='!text-md !px-2 !py-[1px] !bg-warning'
                  >
                    Delete
                  </Button>
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        }
        trigger='click'
      >
        <div
          className='event flex flex-col h-[100%] w-full cursor-pointer'
          style={{ background: backgroundColor }}
        >
          <span>{title}</span>
        </div>
      </Tippy>
    );
  }
  // Disable Date in the Past
  return (
    <>
      <Modal isShow={false} />

      <div className='sticky top-[110px]'>
        {selectOptions && selectOptions.length > 0 && (
          <Select
            containerClass='flex flex-row items-center mb-4 w-full my-[10px]'
            labelClass='mr-5 text-lg text-black'
            selectClass='!text-[16px] py-[8px] px-[10px] cursor-pointer w-[130px]'
            // options={officesData}
            options={selectOptions}
            onSelectOption={handleSelectOfficeSorting}
            label='Office'
            defaultValue={selectedOffice}
          />
        )}

        <FullCalendar
          datesSet={handleDatesSet}
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={initialView}
          headerToolbar={{
            start: "today prev,next",
            center: "title",
            end: "dayGridMonth,timeGridWeek,timeGridDay"
          }}
          eventDidMount={({ event, el }) => {
            const startTime = dateToStringTime(event.start);
            const endTime = dateToStringTime(event.end);
            const roomName = event.extendedProps.name;
            const floor = event.extendedProps.floor;
            const title = `${event.title}\n ${roomName}, ${floor}, ${startTime} - ${endTime}`;
            el.setAttribute("title", title);
          }}
          height={height}
          weekends={weekends}
          events={events}
          eventContent={renderEventContent}
          dateClick={handleDateClick}
          dayMaxEventRows={4}
        />
      </div>
    </>
  );
};

export default CalendarComponent;
