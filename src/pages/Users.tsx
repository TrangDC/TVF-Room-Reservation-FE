import { useMutation, useQuery } from "@apollo/client";
import { Box, Button, Grid, TextField } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarFilterButton
} from "@mui/x-data-grid";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { toast } from "react-toastify";
import * as yup from "yup";
import { ASSIGN_ROLE, GET_ADMINS, GET_ROLES, UNASSIGN_ROLE } from "../api/user/query";
import Modal from "../components/common/modal";
import { TOAST_FORM_ID } from "../constants/toastId";
import { USER_ROLE } from "../constants/role";
import { IRoleAPI } from "../api/user/type";

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
  const { data: dataAdmins, refetch: refetchGetAdmins } = useQuery(GET_ADMINS);
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

  useEffect(() => {
    if (!dataRoles) return;
    const getAdminRoleId = dataRoles.GetRoles.find(
      (role: IRoleAPI) => role.machineName === USER_ROLE.ADMINISTRATOR
    ).id;
    setAdminRoleId(getAdminRoleId);
  }, [dataRoles]);

  useEffect(() => {
    if (dataAdmins) {
      const rows = dataAdmins.GetAdmins.map((admin: IDataGridRow) => ({
        id: admin.id,
        name: admin.name,
        workEmail: admin.workEmail
      }));
      setDataGridRows(rows);
    }
  }, [dataAdmins]);

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
      refetchGetAdmins();
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
      refetchGetAdmins();
      setIsShowModal(false);
      return;
    }
  };

  const handleOnClickUnassign = (email: string) => {
    setSelectedEmail(email);
    setIsShowModal(true);
  };

  const handleCancel = () => {
    setIsShowModal(false);
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "workEmail", headerName: "Email", flex: 2.6 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.4,
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

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer>
        <GridToolbarFilterButton />
      </GridToolbarContainer>
    );
  };

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
          <h1 className='text-2xl font-bold mb-[20px]'>Add Users</h1>
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
          <Box style={{ height: "70vh", width: "100%" }}>
            <DataGrid
              slots={{ toolbar: CustomToolbar }}
              rows={dataGridRows}
              columns={columns}
              hideFooterPagination={true}
            />
          </Box>
        </div>
      </div>
    </>
  );
}

export default Users;
