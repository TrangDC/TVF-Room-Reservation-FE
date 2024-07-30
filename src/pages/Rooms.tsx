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
  GridToolbarContainer
} from "@mui/x-data-grid";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import { TiEdit } from "react-icons/ti";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { IOffice } from "../api/office/type";
import {
  CREATE_ROOM,
  DELETE_ROOM,
  GET_OFFICES_ROOM,
  GET_ROOMS,
  UPDATE_ROOM
} from "../api/room/query";
import { IRoom } from "../api/room/type";
import CautionSvg from "../assets/svg/caution.svg";
import ButtonCustom from "../components/common/button/button";
import ExpandableCell from "../components/expandableCell";
import { TOAST_FORM_ID } from "../constants/toastId";

const SignupSchema = Yup.object().shape({
  officeId: Yup.string().required("Required"),
  name: Yup.string().min(2, "Too Short!").max(200, "Too Long!").required("Required"),
  description: Yup.string().min(2, "Too Short!").max(500, "Too Long!").required("Required"),
  floor: Yup.string().required("Required"),
  color: Yup.string().min(2, "Too Short!").max(50, "Too Long!").required("Required"),
  imageUrl: Yup.string()
    .min(2, "Too Short!")
    .matches(
      /^(https?:\/\/)?([\da-z.-]+).([a-z.]{2,6})([/\w .-]*)*\/?$/g,
      "Value does not match validation"
    )
    .required("Required")
});

interface IFormFilter {
  officeId: string | undefined;
  keyFilter: string | undefined;
}

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

function Rooms() {
  const [formFilter, setFormFilter] = useState<IFormFilter>({
    officeId: undefined,
    keyFilter: undefined
  });
  const [pageOption, setPageOption] = useState({
    pageSize: 5,
    page: 0
  });

  // const [total,setTotal] = useState(0)
  const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null);
  // const [roomsData,setRoomsData] = useState<IRoom[]>([])

  const { data: officesApi } = useQuery(GET_OFFICES_ROOM);

  // const [GetRooms,{ refetch: roomsRefresh, data: roomsApi }] = useLazyQuery(GET_ROOMS,{
  //   variables: {
  //     filter: { officeId: formFilter?.officeId ? formFilter?.officeId :officesApi?.GetOffices[0]?.id,searchTerm: formFilter?.keyFilter },
  //     pagination: { page: pageOption.page + 1, perPage: pageOption.pageSize }
  //   },
  // });

  const debouncedSearchTerm = useDebounce(formFilter.keyFilter || "", 500);

  const { refetch: roomsRefresh, data: roomsApi } = useQuery(GET_ROOMS, {
    variables: {
      filter: {
        officeId: formFilter?.officeId ? formFilter?.officeId : officesApi?.GetOffices[0]?.id,
        searchTerm: debouncedSearchTerm
      },
      pagination: { page: pageOption.page + 1, perPage: pageOption.pageSize }
    },
    fetchPolicy: "network-only"
  });

  const officesData: IOffice[] = officesApi?.GetOffices || [];

  const roomsData: IRoom[] = roomsApi?.GetRooms?.data.map((item: IRoom, index: number) => {
    const officesFind = officesData?.find((office) => office.id === item.officeId);
    return {
      count: index + 1,
      id: item.id,
      color: item.color,
      name: item.name,
      floor: item.floor,
      description: item.description,
      imageUrl: item.imageUrl,
      office: officesFind?.name,
      officeId: officesFind?.id
    };
  });

  const total = roomsApi?.GetRooms?.total || 0;

  // useEffect(()=>{
  //   if(officesData && !formFilter?.officeId){
  //     setFormFilter({
  //       ...formFilter,
  //       officeId: officesData ? officesData[0]?.id : ""
  //     })
  //   }
  // },[officesData])

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
      officeId: officesData ? officesData[0]?.id : "",
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
      editable: false
    },
    {
      field: "floor",
      headerName: "Floor",
      width: 150,
      editable: false
    },
    {
      field: "office",
      headerName: "Office name",
      width: 150,
      editable: false
    },
    {
      field: "description",
      headerName: "Description",
      width: 500,
      editable: true,
      renderCell: (params: GridRenderCellParams) => (
        <ExpandableCell {...params} value={params.value.replace(/\\n/g, "\n")} />
      )
    },
    {
      field: "imageUrl",
      headerName: "imageUrl",
      width: 200,
      editable: false,
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
      editable: false,
      renderCell: ({ row }) => {
        return (
          <div className='flex items-center'>
            <TiEdit
              className='cursor-pointer text-2xl text-primary-blue mx-2 text-blue-600'
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
                handleOpenModal(row.officeId);
              }}
            />
            <RiDeleteBin6Line
              className='cursor-pointer text-2xl text-red-500 mx-2'
              onClick={() => handleOpenModalDelete(row.id)}
            />
          </div>
        );
      }
    }
  ];

  useEffect(() => {
    if (selectedRoom) {
      formik.setValues({
        name: selectedRoom.name,
        imageUrl: selectedRoom.imageUrl,
        description: selectedRoom.description,
        officeId: selectedRoom.officeId || officesData[0]?.id,
        floor: selectedRoom.floor,
        color: selectedRoom.color
      });
    } else {
      formik.resetForm();
      formik.setFieldValue("officeId", officesData ? officesData[0]?.id : "");
    }
  }, [openInput]);

  function handleOnChangeFilter(name: string, value: string) {
    setFormFilter({
      ...formFilter,
      [name]: value
    });
  }

  const handleOpenModal = (id?: string) => {
    setOpenInput(true);

    formik.setFieldValue(
      "officeId",
      id ? officesData?.find((item) => item.id === id)?.id : officesData[0]?.id
    );
  };
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
        <div className='grid grid-cols-4 gap-5 mb-5'>
          {officesData.length > 0 && (
            <div className='col-span-1'>
              <FormControl fullWidth>
                <InputLabel id='Offices'>Offices</InputLabel>
                <Select
                  labelId='Offices'
                  id='officeId'
                  name='officeId'
                  label='Offices'
                  size='small'
                  fullWidth
                  placeholder='Search...'
                  value={formFilter?.officeId ? formFilter?.officeId : officesData[0]?.id}
                  onChange={(event) => {
                    const value = event.target.value;
                    const name = event.target.name;
                    handleOnChangeFilter(name, value);
                  }}
                >
                  {officesData?.map((item: IOffice) => {
                    return (
                      <MenuItem key={item.id} value={item.id}>
                        {item.name}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </div>
          )}

          <div className='col-span-1'>
            <TextField
              id='keyFilter'
              name='keyFilter'
              label='Search'
              size='small'
              placeholder='Search...'
              value={formFilter.keyFilter}
              onChange={(event) => {
                const value = event.target.value;
                const name = event.target.name;

                handleOnChangeFilter(name, value);
              }}
              variant='outlined'
              fullWidth
            />
          </div>
        </div>
        {roomsData && (
          <div style={{ height: 700, width: "100%" }}>
            <DataGrid
              rows={roomsData}
              columns={columns}
              rowCount={total}
              // initialState={{
              //   pagination: {
              //     paginationModel: {
              //       pageSize: pageOption.pageSize,
              //       page: pageOption.page,
              //     }
              //   }
              // }}
              paginationModel={{
                pageSize: pageOption.pageSize,
                page: pageOption.page
              }}
              paginationMode='server'
              keepNonExistentRowsSelected
              onPaginationModelChange={(params) => {
                setPageOption({
                  ...pageOption,
                  pageSize: params.pageSize,
                  page: params.page
                });
              }}
              getRowHeight={() => "auto"}
              slots={{
                toolbar: () => (
                  <>
                    {" "}
                    <GridToolbarContainer>
                      <GridToolbarColumnsButton />
                      {/* <GridToolbarFilterButton /> */}
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
              pageSizeOptions={[5]}
              hideFooterPagination={false}
              disableRowSelectionOnClick
            />
          </div>
        )}

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
              width: 870,
              bgcolor: "background.paper",
              // border: '2px solid #000',
              boxShadow: 24,
              p: 4
            }}
          >
            <form onSubmit={formik.handleSubmit}>
              <div className='flex w-full justify-between'>
                <div>
                  {selectedRoom ? (
                    <h1 className='font-semibold text-2xl mb-10'>Update Room</h1>
                  ) : (
                    <h1 className='font-semibold text-2xl mb-10'>Create Room</h1>
                  )}
                </div>
                <div>
                  <Button
                    onClick={() => {
                      handleCloseModal();
                    }}
                  >
                    <RxCross2
                      style={{
                        fontSize: 25
                      }}
                    />
                  </Button>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-5'>
                <div className='col-span-1'>
                  <div className='mb-5'>
                    <FormControl fullWidth>
                      <InputLabel id='Offices'>Offices</InputLabel>
                      <Select
                        labelId='Offices'
                        id='officeId'
                        name='officeId'
                        label='Offices'
                        size='small'
                        fullWidth
                        value={formik.values.officeId}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      >
                        {officesData?.map((item: IOffice) => {
                          return (
                            <MenuItem key={item.id} value={item.id}>
                              {item.name}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </div>

                  <div className='mb-5'>
                    <TextField
                      error={formik.errors.name ? true : false}
                      id='name'
                      name='name'
                      label='Name room'
                      size='small'
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      helperText={formik.errors.name}
                      variant='outlined'
                      fullWidth
                    />
                  </div>
                  <div className='mb-5'>
                    <TextField
                      error={formik.errors.floor ? true : false}
                      id='floor'
                      name='floor'
                      label='Floor'
                      size='small'
                      value={formik.values.floor}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      helperText={formik.errors.floor}
                      variant='outlined'
                      fullWidth
                    />
                  </div>
                  <div className='mb-5'>
                    <TextField
                      error={formik.errors.color ? true : false}
                      id='color'
                      name='color'
                      label='Color'
                      type='color'
                      size='small'
                      value={formik.values.color}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      helperText={formik.errors.color}
                      variant='standard'
                      fullWidth
                    />
                  </div>
                  <div className='mb-5'>
                    <TextField
                      error={formik.errors.description ? true : false}
                      id='description'
                      name='description'
                      label='description'
                      size='small'
                      value={formik.values.description.replace(/\\n/g, "\n")}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      helperText={formik.errors.description}
                      variant='outlined'
                      fullWidth
                      multiline
                      rows={8}
                      maxRows={8}
                    />
                  </div>
                  <div className=''>
                    <TextField
                      error={formik.errors.imageUrl ? true : false}
                      id='imageUrl'
                      name='imageUrl'
                      label='Image'
                      size='small'
                      value={formik.values.imageUrl}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      helperText={formik.errors.imageUrl}
                      variant='outlined'
                      fullWidth
                    />
                  </div>
                </div>

                <div className='col-span-1'>
                  <img
                    src={
                      formik.values.imageUrl ||
                      "https://careers.techvify.com.vn/wp-content/uploads/2022/03/techvify-logo-blue.png"
                    }
                    style={{ width: "100%", height: "50%" }}
                    className={`w-full max-h-full object-cover border-2`}
                  />
                </div>
              </div>

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
            <h3 className='font-semibold text-2xl text-warning text-center border-b border-b-gray-300 py-3'>
              Warning
            </h3>
            <div className='font-semibold text-2xl mb-2 text-center border-b border-b-gray-300'>
              <div className='p-5'>
                <img className='w-16 h-16 mx-auto' src={CautionSvg} alt='caution' />
                <span className='font-semibold text-xl'>Are you sure want to delete room </span>
                <span className='underline'>
                  {/* {roomsData && roomsData.find((item) => item?.id === selectedRoom?.id)?.name} */}
                </span>
                ?
              </div>
            </div>
            <div className='flex justify-center'>
              <ButtonCustom
                className='modal-close text-sm !text-black border rounded-md mx-2 bg-white'
                onClick={handleCloseModalDelete}
              >
                Cancel
              </ButtonCustom>
              <ButtonCustom
                className='text-sm text-white rounded-md mx-2 bg-warning'
                onClick={() => {
                  handleDeleteRoom();
                }}
              >
                Delete
              </ButtonCustom>
            </div>
          </Box>
        </Modal>
      </div>
    </div>
  );
}

export default Rooms;
