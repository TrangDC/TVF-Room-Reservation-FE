import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import Tippy from "@tippyjs/react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import { IBookingAPI } from "../../api/booking/type";
import { TOAST_CALENDAR_ID } from "../../constants/toastId";
import useUserStore from "../../store/store";
import { IExtendedProps } from "../../types/interfaces/calendar";
import { IEvent } from "../../types/interfaces/event";
import { dateToStringTime, testing } from "../../utils/timeFormat";
import Button from "../common/button/button";
import Modal from "../common/modal";
import "./index.scss";

interface CalendarComponentProps {
  events?: IEvent[];
  initialView?: string;
  weekends?: boolean;
  height?: string;
  onClickDate: (date: string) => void;
  onEditBooking?: (id: string) => void;
  onDeleteBooking: (id: string) => void;
  bookings: [];
  onDatesSet: (startDate: string, endDate: string) => void;
}

interface ICalendarEvent extends IEvent {
  extendedProps: IExtendedProps;
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({
  events,
  initialView = "dayGridMonth",
  bookings,
  onDeleteBooking,
  onClickDate,
  weekends = true,
  height = "80vh",
  onDatesSet
}) => {
  const user = useUserStore((state) => state.user);
  const calendarRef = useRef<FullCalendar>(null); // Ref to FullCalendar instance
  const [newBookings, setNewBookings] = useState<IEvent[]>(); // State to hold endDate
  const navigate = useNavigate();

  const handleDatesSet = (arg: { startStr: string; endStr: string }) => {
    const getStartDate = arg.startStr.split("T")[0];
    const getEndDate = arg.endStr.split("T")[0];
    onDatesSet(getStartDate, getEndDate);
  };

  useEffect(() => {
    handleMappingBookingsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings]);

  const handleMappingBookingsData = () => {
    if (bookings) {
      events = bookings?.map((booking: IBookingAPI) => {
        const startRecur = new Date(booking?.startDate ?? "");
        const endRecur = new Date(booking?.endDate ?? "");

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
      setNewBookings(events);
    }
  };

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
    navigate(`/edit/${id}`);
  };

  const handleOnClickDeleteBtn = (id: string) => {
    onDeleteBooking && onDeleteBooking(id);
  };

  function renderEventContent(eventInfo: { event: ICalendarEvent }) {
    const { title, backgroundColor, start, end, id } = eventInfo.event;
    const { name, floor, creatorEmail } = eventInfo.event.extendedProps;

    const startTime = testing(new Date(start).toISOString());
    const endTime = testing(new Date(end).toISOString());

    const handleOnClickEvent = (e: React.MouseEvent) => {
      const meetingElParentEl = (e.target as HTMLElement).parentElement?.parentElement;

      // Remove z-index from previously clicked element
      const previouslyClicked = document.querySelector('[data-clicked="true"]') as HTMLElement;
      if (previouslyClicked) {
        previouslyClicked.style.removeProperty("z-index");
        previouslyClicked.removeAttribute("data-clicked");
      }

      // Set z-index for the newly clicked element
      if (meetingElParentEl) {
        meetingElParentEl.style.zIndex = "999";
        meetingElParentEl.setAttribute("data-clicked", "true");
      }
    };
    return (
      <Tippy
        interactive={true}
        placement='top'
        theme='light'
        content={
          <div className='cursor-default text-nowrap p-3'>
            <div className='flex flex-col mb-2'>
              <div className='!font-semibold text-xl overflow-x-hidden text-ellipsis'>{title}</div>
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
          onClick={handleOnClickEvent}
        >
          <span>{title}</span>
        </div>
      </Tippy>
    );
  }
  // Disable Date in the Past
  return (
    <div className='calendar-container w-full md:w-[66%] md:ml-[10px]'>
      <Modal isShow={false} />

      <div className='sticky top-[92px]'>
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
          timeZone='UTC'
          height={height}
          weekends={weekends}
          events={newBookings}
          eventContent={renderEventContent}
          dateClick={handleDateClick}
          dayMaxEventRows={4}
        />
      </div>
    </div>
  );
};

export default CalendarComponent;
