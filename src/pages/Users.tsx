import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { Box, Button, Grid, TextField } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { toast } from "react-toastify";
import * as yup from "yup";
import { ASSIGN_ROLE, GET_ADMIN_USERS, GET_ROLES, UNASSIGN_ROLE } from "../api/user/query";
import { IRoleAPI } from "../api/user/type";
import Modal from "../components/common/modal";
import Pagination, { IPaginationProps } from "../components/pagination";
import { USER_ROLE } from "../constants/role";
import { TOAST_FORM_ID } from "../constants/toastId";
import { useDebounce } from "../hooks/useDebounce";

interface IDataGridRow {
  id: string;
  name: string;
  workEmail: string;
}

// const rows = [
//   {
//     id: 1,
//     name: "John Doe",
//     email: "smt@gmail.com"
//   },
//   {
//     id: 2,
//     name: "Jane Smith",
//     email: "jane.smith@gmail.com"
//   },
//   {
//     id: 3,
//     name: "Mike Johnson",
//     email: "mike.johnson@gmail.com"
//   },
//   {
//     id: 4,
//     name: "Sarah Johnson",
//     email: "sarah.johnson@gmail.com"
//   },
//   {
//     id: 5,
//     name: "Michael Brown",
//     email: "michael.brown@gmail.com"
//   },
//   {
//     id: 6,
//     name: "Emily Davis",
//     email: "emily.davis@gmail.com"
//   },
//   {
//     id: 7,
//     name: "David Wilson",
//     email: "david.wilson@gmail.com"
//   },
//   {
//     id: 8,
//     name: "Olivia Taylor",
//     email: "olivia.taylor@gmail.com"
//   },
//   {
//     id: 9,
//     name: "James Anderson",
//     email: "james.anderson@gmail.com"
//   },
//   {
//     id: 10,
//     name: "Sophia Martinez",
//     email: "sophia.martinez@gmail.com"
//   },
//   {
//     id: 11,
//     name: "Daniel Thomas",
//     email: "daniel.thomas@gmail.com"
//   },
//   {
//     id: 12,
//     name: "Ava Garcia",
//     email: "ava.garcia@gmail.com"
//   },
//   {
//     id: 13,
//     name: "William Rodriguez",
//     email: "william.rodriguez@gmail.com"
//   }
// ];

const validationSchema = yup.object({
  workEmail: yup.string().email("Enter a valid email").required("Email is required")
});

function Users() {
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [selectedEmail, setSelectedEmail] = useState<string>("");
  const [getAdminUsers, { data: dataAdmins }] = useLazyQuery(GET_ADMIN_USERS);
  const { data: dataRoles } = useQuery(GET_ROLES);
  const [dataGridRows, setDataGridRows] = useState<IDataGridRow[]>([]);
  const [adminRoleId, setAdminRoleId] = useState<string>();
  const [AssignRole] = useMutation(ASSIGN_ROLE, {
    errorPolicy: "all"
  });
  const [UnassignRole] = useMutation(UNASSIGN_ROLE, {
    errorPolicy: "all"
  });
  const formik = useFormik({
    initialValues: {
      workEmail: ""
    },
    validationSchema: validationSchema,
    onSubmit: (values, { resetForm }) => {
      handleSubmit(values.workEmail, resetForm);
    }
  });
  const [pagination, setPagination] = useState<IPaginationProps | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    getAdminUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    debouceHandleSearchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  useEffect(() => {
    if (!dataRoles) return;
    const getAdminRoleId = dataRoles.GetRoles.find(
      (role: IRoleAPI) => role.machineName === USER_ROLE.ADMINISTRATOR
    ).id;
    setAdminRoleId(getAdminRoleId);
  }, [dataRoles]);

  useEffect(() => {
    if (dataAdmins) {
      const totalAdmins = dataAdmins.GetAdminUsers.total;
      const pages = totalAdmins % 12 === 0 ? totalAdmins / 12 : Math.floor(totalAdmins / 12) + 1;
      setPagination({
        pages: pages,
        total: totalAdmins,
        pageSize: 12,
        handleSetPage: handleSetPage
      });
      const rows = dataAdmins.GetAdminUsers.data.map((admin: IDataGridRow) => ({
        id: admin.id,
        name: admin.name,
        workEmail: admin.workEmail
      }));
      setDataGridRows(rows);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataAdmins]);

  const handleSetPage = (page: number) => {
    getAdminUser("", page);
  };

  const handleSearchUser = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPagination(null);
    setSearchQuery(e.target.value);
  };

  const handleSubmit = async (email: string, resetForm: () => void) => {
    const { data: resData, errors } = await AssignRole({
      variables: {
        input: {
          workEmail: email,
          roleID: adminRoleId
        }
      }
    });

    if (errors) {
      toast.warn(errors && errors[0].message, { toastId: TOAST_FORM_ID.ERROR });
      return;
    }
    if (resData) {
      toast.success(resData.AssignRole.message, { toastId: TOAST_FORM_ID.SUCCESS });
      getAdminUser();
      resetForm();
      return;
    }
  };

  const handleUnassign = async () => {
    const { data: resData, errors } = await UnassignRole({
      variables: {
        input: {
          workEmail: selectedEmail,
          roleID: adminRoleId
        }
      }
    });
    if (errors) {
      toast.warn(errors && errors[0].message, { toastId: TOAST_FORM_ID.ERROR });
    }

    if (resData) {
      toast.success(resData.UnassignRole.message, { toastId: TOAST_FORM_ID.SUCCESS });
      getAdminUser();
      setIsShowModal(false);
      return;
    }
  };

  const getAdminUser = async (keyword?: string, page?: number) => {
    getAdminUsers({
      variables: {
        pagination: {
          page: page || 1,
          perPage: 12
        },
        keyword: keyword || searchQuery
      },
      fetchPolicy: "network-only"
    });
  };

  const debouceHandleSearchUser = useDebounce(getAdminUser, 300);

  const handleOnClickUnassign = (email: string) => {
    setSelectedEmail(email);
    setIsShowModal(true);
  };

  const handleCancel = () => {
    setIsShowModal(false);
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1, minWidth: 200 },
    { field: "workEmail", headerName: "Email", flex: 2.6 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.4,
      minWidth: 100,
      renderCell: (params) => (
        <div className='flex flex-row items-center cursor-pointer'>
          <RiDeleteBin6Line
            className='px-[10px] py-[8px] text-[40px] text-[#ff1515]'
            onClick={() => handleOnClickUnassign(params?.row.workEmail)}
          />
        </div>
      )
    }
  ];

  return (
    <>
      <Modal
        textDelete='Unassign'
        isShow={isShowModal}
        onClickCancel={handleCancel}
        onClickDelete={handleUnassign}
      />

      <div className='w-full flex flex-col justify-center items-center'>
        <div className='w-[90%] mt-[60px]'>
          <p className='mb-[10px] font-bold text-[#0d73d3] text-[20px]'>Add Users</p>

          <form className='mb-5' onSubmit={formik.handleSubmit}>
            <Grid container>
              <Grid item paddingRight={1.5}>
                <TextField
                  id='email'
                  name='workEmail'
                  label='Email'
                  size='small'
                  value={formik.values.workEmail}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.workEmail && Boolean(formik.errors.workEmail)}
                  helperText={formik.touched.workEmail && formik.errors.workEmail}
                />
                <Button
                  style={{ marginLeft: 10, marginTop: 2 }}
                  color='primary'
                  variant='contained'
                  type='submit'
                >
                  Add User
                </Button>
              </Grid>
            </Grid>
          </form>
          <Box style={{ marginBottom: 15 }}>
            <TextField
              id='search'
              label='Search user...'
              size='small'
              onChange={handleSearchUser}
            />
          </Box>
          <Box style={{ height: "70vh", width: "100%" }}>
            <DataGrid
              rows={dataGridRows}
              columns={columns}
              hideFooterPagination={true}
              hideFooter={true}
            />
          </Box>
          <Pagination data={pagination} />
        </div>
      </div>
    </>
  );
}

export default Users;
