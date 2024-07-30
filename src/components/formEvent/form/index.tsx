import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { IOfficeApi } from "../../../api/office/type";
import { IRoom } from "../../../api/room/type";
import { TOAST_FORM_ID } from "../../../constants/toastId";
import { useDebounce } from "../../../hooks/useDebounce";
import useBookingStore from "../../../store/bookingStore";
import { IFormData, IFormEvent, IFormEventEdit } from "../../../types/interfaces/event";
import { localStorageHelper } from "../../../utils/localStorage";
import { stringToNumber } from "../../../utils/timeFormat";
import Button from "../../common/button/button";
import InputField from "../../common/Input";
import Select from "../../common/select";
import RoomInfo from "../../room";
import { useNavigate } from "react-router";

interface IFormEventComponent {
  defaultValue?: IFormEvent;
  offices?: IOfficeApi[];
  clickedDate: string;
  rooms?: IRoom[];
  isEdit: boolean;
  onCancelEdit: () => void;
  dataEdit: IFormEventEdit | undefined;
  getFormData: (data: IFormData, getSelectedOfficeId: string) => void;
  onSubmit: (data: IFormEvent) => Promise<boolean>;
}

function FormEvent({
  onSubmit,
  clickedDate,
  offices,
  isEdit,
  onCancelEdit,
  getFormData,
  dataEdit,
  rooms
}: IFormEventComponent) {
  const getSelectedOfficeId =
    localStorageHelper.get<string>(localStorageHelper.LOCAL_STORAGE_KEYS.FORM_MEETING_OFFICEID) ||
    "";
  const getFormDataLocalStorage = useMemo(
    () => localStorageHelper.get(localStorageHelper.LOCAL_STORAGE_KEYS.FORM_DATA),
    []
  );
  const navigate = useNavigate();
  const { clearBookingDetails, clearBookingId, setOfficeId } = useBookingStore();
  const reservationDayRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const currentDay = String(currentDate.getDate()).padStart(2, "0");
  // Format the date as YYYY-MM-DD
  const formattedCurrentDate = `${currentYear}-${currentMonth}-${currentDay}`;
  const [formData, setFormData] = useState<IFormData>({
    isRepeat: false,
    title: "",
    reservationDay: formattedCurrentDate,
    startTime: "09:00",
    endTime: "",
    endDate: "",
    roomId: "",
    officeId: getSelectedOfficeId
  });

  useEffect(() => {
    if (!getFormDataLocalStorage) return;
    setFormData((prev) => {
      return { ...prev, ...getFormDataLocalStorage };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getFormDataLocalStorage]);

  useEffect(() => {
    if (isEdit) {
      setFormData({
        isRepeat: dataEdit?.isRepeat || false,
        title: dataEdit?.title,
        reservationDay: dataEdit?.startDate?.slice(0, 10),
        startTime: dataEdit?.startDate?.slice(11, 16),
        endTime: dataEdit?.endDate?.slice(11, 16),
        endDate: dataEdit?.endDate?.slice(0, 10),
        roomId: dataEdit?.room?.id,
        officeId: dataEdit?.office?.id
      });
    } else {
      setFormData({
        isRepeat: false,
        title: "",
        reservationDay: formattedCurrentDate,
        startTime: "09:00",
        endTime: "",
        endDate: "",
        roomId: "",
        officeId: getSelectedOfficeId
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, dataEdit]);

  useEffect(() => {
    debouceFormData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, getSelectedOfficeId]);

  useEffect(() => {
    if (!clickedDate) return;

    setFormData((prev) => ({ ...prev, reservationDay: clickedDate }));
  }, [clickedDate]);

  const handleStoreGetFormData = () => {
    getFormData && getFormData(formData, getSelectedOfficeId);
    localStorageHelper.set(
      localStorageHelper.LOCAL_STORAGE_KEYS.FORM_DATA,
      JSON.stringify(formData)
    );
  };

  const debouceFormData = useDebounce(handleStoreGetFormData, 500);

  const handleCheckboxChange = () => {
    setFormData((prev) => ({ ...prev, isRepeat: !prev.isRepeat }));
  };

  function handleSelectOffice(officeId: string) {
    localStorageHelper.set(localStorageHelper.LOCAL_STORAGE_KEYS.FORM_MEETING_OFFICEID, officeId);
    setOfficeId(officeId);
    setFormData((prev) => ({ ...prev, roomId: "", officeId }));
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let inputValue: string = value;

    if (name === "reservationDay" || name === "endDate") {
      if (name === "reservationDay") {
        if (formattedCurrentDate < value) {
          inputValue = value;
        } else {
          inputValue = formattedCurrentDate;
          toast.warn("Selected date cannot be in the past!", {
            toastId: TOAST_FORM_ID.WARNING
          });
        }
      } else {
        if (formData.reservationDay && formData.reservationDay <= value) {
          inputValue = value;
        } else if (!formData.reservationDay) {
          toast.warn("Please select meeting reservation day!", {
            toastId: TOAST_FORM_ID.WARNING
          });
          inputValue = "";
        } else {
          toast.warn("Selected date cannot precede reservation day!", {
            toastId: TOAST_FORM_ID.WARNING
          });
          inputValue = formData.endDate || "";
        }
      }
    }
    setFormData((prev) => ({ ...prev, [name]: inputValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.warn("Reservation information cannot be empty!", {
        toastId: TOAST_FORM_ID.WARNING
      });
      return;
    }

    if (!formData.roomId) {
      toast.warn("Please choose a room", {
        toastId: TOAST_FORM_ID.WARNING
      });
      return;
    }

    if (!formData.reservationDay) {
      toast.warn("Start date cannot be empty!", {
        toastId: TOAST_FORM_ID.WARNING
      });
      return;
    }

    if (formData.reservationDay < formattedCurrentDate) {
      toast.warn("Selected date cannot be in the past!", {
        toastId: TOAST_FORM_ID.WARNING
      });
      return;
    }

    if (!formData.roomId || !formData.officeId) {
      toast.warn("Please fill all the form", {
        toastId: TOAST_FORM_ID.WARNING
      });
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      toast.warn("Please select when meeting start and end!", {
        toastId: TOAST_FORM_ID.WARNING
      });
      return;
    }

    if (formData.isRepeat && !formData.endDate) {
      toast.warn("Please select end date!", {
        toastId: TOAST_FORM_ID.WARNING
      });
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      toast.warn("Please select when meeting start and end!", {
        toastId: TOAST_FORM_ID.WARNING
      });
      return;
    }

    const [endTimeHours, endTimeMinutes] = formData.endTime.split(":");
    const [startTimeHours, startTimeMinutes] = formData.startTime
      ? formData.startTime.split(":")
      : "";
    const endTimeMinutesFormat = stringToNumber(endTimeHours, endTimeMinutes);
    const startTimeMinutesFormat = stringToNumber(startTimeHours, startTimeMinutes);

    const validateMeetingDuration =
      endTimeMinutesFormat - startTimeMinutesFormat <= 60 &&
      endTimeMinutesFormat - startTimeMinutesFormat > 0;

    if (!formData.startTime) {
      toast.warn("Please select when meeting start!", {
        toastId: TOAST_FORM_ID.WARNING
      });
    } else if (formData.startTime < formData.endTime && !validateMeetingDuration) {
      toast.warn("Meeting duration must be less than an hour!", {
        toastId: TOAST_FORM_ID.WARNING
      });
    } else if (formData.startTime >= formData.endTime) {
      toast.warn("Selected end time cannot precede or equal to start time!", {
        toastId: TOAST_FORM_ID.WARNING
      });
      return;
    }

    if (formData.endTime) {
      const [startTimeHours, startTimeMinutes] = formData.startTime.split(":");
      const [endTimeHours, endTimeMinutes] = formData.endTime.split(":");
      const endTimeMinutesFormat = stringToNumber(endTimeHours, endTimeMinutes);
      const startTimeMinutesFormat = stringToNumber(startTimeHours, startTimeMinutes);
      const validateMeetingDuration =
        endTimeMinutesFormat - startTimeMinutesFormat <= 60 &&
        endTimeMinutesFormat - startTimeMinutesFormat > 0;

      if (!validateMeetingDuration) {
        toast.warn("Meeting duration must be within an hour!", {
          toastId: TOAST_FORM_ID.WARNING
        });
        return;
      }
    }

    let endDateFormat;

    const startTime = new Date(`${formData.reservationDay}T${formData.startTime}`);
    const endTime = new Date(`${formData.reservationDay}T${formData.endTime}`);
    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);

    if (duration > 60) {
      toast.warn("Maximum time for meeting is 1 hour", {
        toastId: TOAST_FORM_ID.WARNING
      });
      return;
    }

    const startDateFormat = `${formData.reservationDay}T${formData.startTime}:00Z`;

    if (formData.isRepeat) {
      endDateFormat = `${formData.endDate}T${formData.endTime}:00Z`;
    } else {
      endDateFormat = `${formData.reservationDay}T${formData.endTime}:00Z`;
    }

    const trimmedReservationInfo = formData?.title && formData.title.replace(/\s+/g, " ").trim();

    const newEvent = {
      title: trimmedReservationInfo || "",
      roomId: formData.roomId || "",
      officeId: formData.officeId || "",
      startDate: startDateFormat,
      endDate: endDateFormat,
      isRepeat: formData.isRepeat || false
    };

    const res = await onSubmit(newEvent);
    if (res as boolean) {
      handleCancelEdit();
    }
  };

  const generateTimeOptions = (startTime = "", endTime = "") => {
    const times = [];
    for (let h = 9; h < 18; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hour = String(h).padStart(2, "0");
        const minute = String(m).padStart(2, "0");
        const time = `${hour}:${minute}`;
        if (startTime && time <= startTime) continue;
        if (endTime && time >= endTime) continue;
        times.push(time);
      }
    }
    return times;
  };

  const startTimes = generateTimeOptions("", formData.endTime);
  const endTimes = generateTimeOptions(formData.startTime);

  const handleSelectRoom = (roomId: string) => {
    if (rooms?.find((room) => room.id === roomId)?.status === false) {
      toast.warn("This room is not available");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      roomId: roomId
    }));
  };

  const handleCancelEdit = () => {
    clearBookingDetails();
    clearBookingId();
    navigate("/");
    setFormData((prev) => {
      return {
        ...prev,
        title: "",
        roomId: "",
        startDate: clickedDate,
        startTime: "09:00",
        endTime: "",
        endDate: "",
        isRepeat: false
      };
    });
    onCancelEdit && onCancelEdit();
  };

  return (
    <div className='form-container'>
      <div className='form-wrapper w-[100%] flex flex-col items-center md:items-start '>
        <p className='font-[700] text-[20px] mb-[3px]'>TECHVIFY - Meeting Form</p>
        <div className='flex-col items-center flex md:flex-row w-full'>
          <form onSubmit={handleSubmit} className='w-full'>
            {offices && offices.length > 0 && (
              <Select
                name='office'
                containerClass='flex flex-col mb-4 w-full mb-[10px]'
                labelClass='mr-5 text-lg text-black'
                required={true}
                selectClass='!text-[16px] !p-[8px] cursor-pointer'
                defaultValue={formData.officeId || ""}
                options={offices}
                onSelectOption={handleSelectOffice}
                label='Choose an office'
              />
            )}

            <InputField
              type='text'
              name='title'
              id='title'
              required={true}
              maxLength={200}
              label='Reservation Information'
              value={formData.title}
              onChange={handleInputChange}
              title='title'
            />

            <InputField
              type='date'
              name='reservationDay'
              id='reservationDay'
              required={true}
              ref={reservationDayRef}
              label='Reservation Day'
              // max={formData.endDate}
              value={formData.reservationDay}
              onClick={() => reservationDayRef.current?.showPicker()}
              onChange={handleInputChange}
            />

            <div className='relative z-0 w-full mb-[20px] group'>
              <label htmlFor='startTime' className='text-gray-500'>
                Start at: <span className='text-xl text-red-500'>*</span>
              </label>
              <select
                id='startTime'
                name='startTime'
                value={formData.startTime}
                onChange={handleInputChange}
                className='w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5'
              >
                <option value='' disabled>
                  ---Choose start hours---
                </option>
                {startTimes.map((option) => (
                  <option
                    key={option.toString()}
                    disabled={formData.endTime ? formData.endTime <= option : false}
                  >
                    {option}
                  </option>
                ))}
                {generateTimeOptions()}
              </select>
            </div>

            <div className='relative z-0 w-full mb-[20px] group'>
              <label htmlFor='endTime' className='text-gray-500'>
                End at: <span className='text-xl text-red-500'>*</span>
              </label>
              <select
                id='endTime'
                name='endTime'
                value={formData.endTime}
                onChange={handleInputChange}
                className='cursor-pointer w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5'
              >
                <option value='' disabled>
                  ---Choose end hours---
                </option>
                {endTimes.map((option) => (
                  <option
                    key={option.toString()}
                    // disabled={formData.startTime ? formData.startTime <= option : false}
                  >
                    {option}
                  </option>
                ))}
                {generateTimeOptions()}
              </select>
            </div>

            <div className='flex items-center my-[20px]'>
              <input
                onChange={handleCheckboxChange}
                id='link-checkbox'
                type='checkbox'
                checked={formData.isRepeat}
                className='cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600'
              />
              <label htmlFor='link-checkbox' className='ms-2 text-sm font-medium text-gray-900 '>
                Multi-day Reservation
              </label>
            </div>

            {formData.isRepeat && (
              <InputField
                type='date'
                name='endDate'
                id='endDate'
                required={true}
                label='End Date'
                ref={endDateRef}
                onClick={() => endDateRef.current?.showPicker()}
                value={formData.endDate}
                onChange={handleInputChange}
              />
            )}

            {rooms ? (
              rooms.length > 0 ? (
                <div className='grid grid-cols-3 gap-4 my-10'>
                  {rooms.map((room) => {
                    return (
                      <RoomInfo
                        key={room.id}
                        id={room.id}
                        name={room.name}
                        status={room.status}
                        selectedId={formData.roomId}
                        description={room.description}
                        color={room.color}
                        image={room.imageUrl}
                        onClick={handleSelectRoom}
                      />
                    );
                  })}
                </div>
              ) : (
                <h5 className='text-center text-2xl text-red-600 mb-5'>Hiện chưa có phòng</h5>
              )
            ) : (
              ""
            )}
            <div className='flex gap-4'>
              <Button className='hidden' type='submit' children={isEdit ? "Edit" : "Submit"} />
              {isEdit && (
                <Button
                  onClick={handleCancelEdit}
                  className='hidden bg-white border-2 !text-black'
                  children={"Cancel"}
                />
              )}
            </div>
          </form>
        </div>
        <div
          className="
          className='mt-5 md:!hidden block'
        "
        >
          <Button onClick={handleSubmit} type='submit' children={isEdit ? "Edit" : "Submit"} />
          {isEdit && (
            <Button
              onClick={handleCancelEdit}
              className='hidden bg-white border-2 !text-black'
              children={"Cancel"}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default FormEvent;
