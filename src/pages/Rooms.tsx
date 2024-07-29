import { useMutation, useQuery } from "@apollo/client";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton
} from "@mui/x-data-grid";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import { TiEdit } from "react-icons/ti";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { GET_OFFICES } from "../api/office/query";
import { IOfficeApi, IRoomApi } from "../api/office/type";
import { CREATE_ROOM, DELETE_ROOM, UPDATE_ROOM } from "../api/room/query";
import { IRoom } from "../api/room/type";
import SelectCustom from "../components/common/select";
import { TOAST_FORM_ID } from "../constants/toastId";
import ExpandableCell from "../components/expandableCell";

const SignupSchema = Yup.object().shape({
  officeId: Yup.string().required("Required"),
  name: Yup.string().min(2, "Too Short!").max(200, "Too Long!").required("Required"),
  description: Yup.string().min(2, "Too Short!").max(500, "Too Long!").required("Required"),
  floor: Yup.string().required("Required"),
  color: Yup.string().min(2, "Too Short!").max(50, "Too Long!").required("Required"),
  imageUrl: Yup.string()
    .min(2, "Too Short!")
    .max(200, "Too Long!")
    .matches(
      /^(https?:\/\/)?([\da-z.-]+).([a-z.]{2,6})([/\w .-]*)*\/?$/g,
      "Value does not match validation"
    )
    .required("Required")
});

function Rooms() {
  const { refetch: roomsRefresh, data: officesData } = useQuery(GET_OFFICES);
  const [roomsData, setRoomsData] = useState<IRoom[]>([]);
  const [selectedIdOffice, setSelectedOffice] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null);

  const [DeleteRoom] = useMutation(DELETE_ROOM);

  const [CreateRoom] = useMutation(CREATE_ROOM, {
    errorPolicy: "all"
  });
  const [UpdateRoom] = useMutation(UPDATE_ROOM, {
    errorPolicy: "all"
  });

  const [openInput, setOpenInput] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      imageUrl: "",
      description: "",
      officeId: officesData?.GetOffices[0]?.id,
      floor: "",
      color: "#000000"
    },
    validationSchema: SignupSchema,
    validateOnChange: false,
    onSubmit: async (values) => {
      if (selectedRoom) {
        const { data: resData, errors } = await UpdateRoom({
          variables: {
            input: {
              imageUrl: formik.values.imageUrl,
              description: formik.values.description,
              officeId: formik.values.officeId,
              floor: formik.values.floor,
              color: formik.values.color,
              name: formik.values.name,
              id: selectedRoom.id
            }
          }
        });

        if (resData) {
          toast.success(resData.UpdateRoom.message, { toastId: TOAST_FORM_ID.SUCCESS });
          roomsRefresh();
          handleCloseModal();
        }

        if (errors) {
          toast.warn(errors && errors[0].message, { toastId: TOAST_FORM_ID.ERROR });
          return false;
        }
      } else {
        const { data: resData, errors } = await CreateRoom({
          variables: {
            input: {
              name: values.name,
              imageUrl: values.imageUrl,
              description: values.description,
              officeId: values.officeId,
              floor: values.floor,
              color: values.color
            }
          }
        });

        if (resData) {
          toast.success(resData.CreateRoom.message, { toastId: TOAST_FORM_ID.SUCCESS });
          roomsRefresh();
          handleCloseModal();
        }

        if (errors) {
          toast.warn(errors && errors[0].message, { toastId: TOAST_FORM_ID.ERROR });
        }
      }
    }
  });

  const columns: GridColDef[] = [
    { field: "count", headerName: "ID", width: 90 },
    {
      field: "name",
      headerName: "Room name",
      width: 150,
      editable: true
    },
    {
      field: "floor",
      headerName: "Floor",
      width: 150,
      editable: true
    },
    {
      field: "office",
      headerName: "Office name",
      width: 150,
      editable: true
    },
    {
      field: "description",
      headerName: "Description",
      width: 300,
      editable: true,
      renderCell: (params: GridRenderCellParams) => (
        <ExpandableCell {...params} value={params.value.replace(/\\n/g, "\n")} />
      )
      // renderCell: ({ value }) => (<div className="w-20 h-20">{value.replace(/\\n/g, "\n")}</div>)
    },
    {
      field: "imageUrl",
      headerName: "imageUrl",
      width: 200,
      editable: true,
      renderCell: ({ value, row }) => {
        return (
          <img
            src={
              `${value}` ||
              "https://careers.techvify.com.vn/wp-content/uploads/2022/03/techvify-logo-blue.png"
            }
            style={{ borderColor: row.color }}
            className={`w-full max-h-full object-contain border-2`}
          />
        );
      }
    },
    {
      field: "action",
      headerName: "action",
      width: 150,
      editable: true,
      renderCell: ({ row }) => {
        return (
          <div className='flex items-center'>
            <TiEdit
              className='cursor-pointer text-2xl text-primary-blue mx-5'
              onClick={() => {
                setSelectedRoom({
                  id: row.id,
                  name: row.name,
                  color: row.color,
                  floor: row.floor,
                  status: row.status,
                  description: row.description,
                  imageUrl: row.imageUrl,
                  officeId: row.officeId
                });
                handleOpenModal();
              }}
            />
            <RiDeleteBin6Line
              className='cursor-pointer text-2xl text-red-500 mx-5'
              onClick={() => handleOpenModalDelete(row.id)}
            />
          </div>
        );
      }
    }
  ];

  useEffect(() => {
    if (!officesData) return;
    const officeFind = selectedIdOffice
      ? officesData?.GetOffices?.find((item: IOfficeApi) => item.id === selectedIdOffice)
      : officesData?.GetOffices[0];
    const roomsFind = officeFind?.rooms?.map((item: IRoomApi, index: number) => {
      return {
        count: index + 1,
        id: item.id,
        color: item.color,
        name: item.name,
        floor: item.floor,
        description: item.description,
        imageUrl: item.imageUrl,
        office: officeFind.name,
        officeId: officeFind.id
      };
    });

    if (roomsFind) {
      setRoomsData(roomsFind || []);
    }
  }, [officesData, selectedIdOffice]);

  useEffect(() => {
    if (selectedRoom) {
      formik.setValues({
        name: selectedRoom.name,
        imageUrl: selectedRoom.imageUrl,
        description: selectedRoom.description,
        officeId: selectedRoom.officeId,
        floor: selectedRoom.floor,
        color: selectedRoom.color
      });
    } else {
      formik.resetForm();
      formik.setFieldValue("officeId", officesData ? officesData?.GetOffices[0]?.id : "");
      // formik.setValues({
      //     name: "",
      //     imageUrl: "",
      //     description: "",
      //     officeId: officesData ? officesData?.GetOffices[0]?.id : "",
      //     floor: "",
      //     color: "#000000"
      // });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openInput]);

  function handleSelectOffice(officeId: string) {
    setSelectedOffice(officeId);
  }

  const handleOpenModal = () => setOpenInput(true);
  const handleCloseModal = () => {
    setSelectedRoom(null);
    setOpenInput(false);
  };

  const handleOpenModalDelete = (id: string) => {
    const roomFind = roomsData.find((item) => item.id === id);
    if (roomFind) {
      setOpenDelete(true);
      setSelectedRoom(roomFind);
    }
  };
  const handleCloseModalDelete = () => {
    setOpenDelete(false);
    setSelectedRoom(null);
  };

  const handleDeleteRoom = async () => {
    await DeleteRoom({
      variables: {
        roomID: selectedRoom?.id
      }
    });
    toast.success("Delete room success!");
    roomsRefresh();
    handleCloseModalDelete();
  };

  return (
    <div className='w-full flex flex-col justify-center items-center'>
      <div className='w-[90%] mt-[60px]'>
        <p className='mb-[10px] font-bold text-[#0d73d3] text-[20px]'>All Rooms</p>
        {/* {
          officesData?.map(item=>{
            return <div>{item.name}</div>
          })
        } */}

        <SelectCustom
          name='office'
          containerClass='flex flex-col mb-4 w-full my-[10px]'
          labelClass='mr-5 text-lg text-black'
          selectClass='!text-[16px] !p-[8px] cursor-pointer'
          defaultValue={"cdc553c3-71da-4a7a-aa66-391452da6126"}
          options={officesData?.GetOffices}
          onSelectOption={handleSelectOffice}
          label='Choose an office'
        />
        <div style={{ height: 700, width: "100%" }}>
          <DataGrid
            rows={roomsData}
            columns={columns}
            // initialState={{
            //   pagination: {
            //     paginationModel: {
            //       pageSize: 10
            //     }
            //   }
            // }}
            getRowHeight={() => "auto"}
            slots={{
              toolbar: () => (
                <>
                  {" "}
                  <GridToolbarContainer>
                    <GridToolbarColumnsButton />
                    <GridToolbarFilterButton />
                    <Button
                      variant='text'
                      startIcon={<IoMdAdd />}
                      onClick={() => {
                        handleOpenModal();
                      }}
                    >
                      Add Room
                    </Button>
                  </GridToolbarContainer>
                </>
              )
            }}
            // pageSizeOptions={[5]}
            hideFooterPagination={true}
            disableRowSelectionOnClick
          />
        </div>

        <Modal
          open={openInput}
          onClose={handleCloseModal}
          aria-labelledby='modal-modal-title'
          aria-describedby='modal-modal-description'
        >
          <Box
            sx={{
              position: "absolute" as const,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              // border: '2px solid #000',
              boxShadow: 24,
              p: 4
            }}
          >
            <form onSubmit={formik.handleSubmit}>
              {selectedRoom ? (
                <h1 className='font-semibold text-2xl mb-16'>Update Room</h1>
              ) : (
                <h1 className='font-semibold text-2xl mb-16'>Create Room</h1>
              )}
              <FormControl fullWidth>
                <InputLabel id='Offices'>Offices</InputLabel>
                <Select
                  labelId='Offices'
                  id='officeId'
                  name='officeId'
                  label='Offices'
                  fullWidth
                  value={formik.values.officeId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  {officesData?.GetOffices?.map((item: IOfficeApi) => {
                    return (
                      <MenuItem key={item.id} value={item.id}>
                        {item.name}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              <TextField
                style={{
                  marginTop: 20
                }}
                error={formik.errors.name ? true : false}
                id='name'
                name='name'
                label='Name room'
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                helperText={formik.errors.name}
                variant='standard'
                fullWidth
              />
              <TextField
                style={{
                  marginTop: 30
                }}
                error={formik.errors.description ? true : false}
                id='description'
                name='description'
                label='description'
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                helperText={formik.errors.description}
                variant='standard'
                fullWidth
                multiline
                maxRows={3}
              />
              <TextField
                style={{
                  marginTop: 30
                }}
                error={formik.errors.floor ? true : false}
                id='floor'
                name='floor'
                label='Floor'
                value={formik.values.floor}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                helperText={formik.errors.floor}
                variant='standard'
                fullWidth
              />
              <TextField
                style={{
                  marginTop: 30
                }}
                error={formik.errors.color ? true : false}
                id='color'
                name='color'
                label='Color'
                type='color'
                value={formik.values.color}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                helperText={formik.errors.color}
                variant='standard'
                fullWidth
              />
              <TextField
                style={{
                  marginTop: 30
                }}
                error={formik.errors.imageUrl ? true : false}
                id='imageUrl'
                name='imageUrl'
                label='Image'
                value={formik.values.imageUrl}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                helperText={formik.errors.imageUrl}
                variant='standard'
                fullWidth
              />

              <div className='flex justify-center'>
                {selectedRoom ? (
                  <Button
                    style={{
                      marginTop: 30
                    }}
                    type='submit'
                    variant='contained'
                  >
                    Update
                  </Button>
                ) : (
                  <Button
                    style={{
                      marginTop: 30
                    }}
                    type='submit'
                    variant='contained'
                  >
                    Create
                  </Button>
                )}
              </div>
            </form>
          </Box>
        </Modal>

        <Modal
          open={openDelete}
          onClose={handleCloseModalDelete}
          aria-labelledby='modal-modal-title'
          aria-describedby='modal-modal-description'
        >
          <Box
            sx={{
              position: "absolute" as const,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              // border: '2px solid #000',
              boxShadow: 24,
              p: 4
            }}
          >
            <h1 className='font-semibold text-2xl mb-16 text-center'>
              Are you sure you want to delete room{" "}
              <span className='underline'>
                {roomsData && roomsData.find((item) => item?.id === selectedRoom?.id)?.name}
              </span>{" "}
              ?
            </h1>
            <div className='flex justify-between'>
              <Button variant='contained' onClick={handleCloseModalDelete}>
                Cancel
              </Button>
              <Button
                color='error'
                variant='contained'
                onClick={() => {
                  handleDeleteRoom();
                }}
              >
                Delete
              </Button>
            </div>
          </Box>
        </Modal>
      </div>
    </div>
  );
}

export default Rooms;
