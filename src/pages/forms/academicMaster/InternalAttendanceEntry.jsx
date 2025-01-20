import { useEffect, useState } from "react";
import axios from "../../../services/Api";
import GridIndex from "../../../components/GridIndex";
import { Avatar, Button, Grid, IconButton, Typography } from "@mui/material";
import useAlert from "../../../hooks/useAlert";
import CustomModal from "../../../components/CustomModal";

function InternalAttendanceEntry({ eventDetails, checkAttendanceStatus }) {
  const [data, setData] = useState([]);
  const [selectionModel, setSelectionModel] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmContent, setConfirmContent] = useState({
    title: "",
    message: "",
    buttons: [],
  });
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { setAlertMessage, setAlertOpen } = useAlert();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const stdRes = await axios.get(
        `/api/student/studentDetailsByStudentIds/${eventDetails.student_ids}`
      );
      const stdResData = stdRes.data.data;
      const updatedData = [];
      const presentIds = [];
      stdResData.forEach((item, index) => {
        const tempObj = {
          ...item,
          id: index + 1,
          attendanceStatus: true,
        };
        updatedData.push(tempObj);
        presentIds.push(tempObj.id);
      });
      setData(updatedData);
      setSelectionModel(presentIds);
    } catch (err) {
      setAlertMessage({
        severity: "error",
        message: err.response?.data?.message || "Something went wrong",
      });
      setAlertOpen(true);
    }
  };

  const handleChangeAttendance = (rowData) => {
    const { id, attendanceStatus } = rowData;
    const updatedData = [];
    data.forEach((item) => {
      updatedData.push({
        ...item,
        attendanceStatus:
          item.id === id ? !attendanceStatus : item.attendanceStatus,
      });
    });
    let updateSelection = [...selectionModel];
    if (updateSelection.includes(id)) {
      updateSelection = updateSelection.filter((obj) => obj !== id);
    } else {
      updateSelection.push(id);
    }
    setSelectionModel(updateSelection);
    setData(updatedData);
  };

  const handleSelectionChange = (newSelection) => {
    const updatedData = [];
    data.forEach((item) => {
      updatedData.push({
        ...item,
        attendanceStatus: newSelection.includes(item.id),
      });
    });
    setSelectionModel(newSelection);
    setData(updatedData);
  };

  const handleCreate = async () => {
    const { id, emp_ids, internal_id } = eventDetails;
    try {
      setLoading(true);
      const studentRoomAssignment = await axios.get(
        `/api/academic/internalStudentAssignment/${id}`
      );
      if (!studentRoomAssignment.data.success)
        throw new Error("Failed to update attendance. Please try again.");
      const studentRoomAssignmentData = studentRoomAssignment.data.data;
      studentRoomAssignmentData.attendance_status = true;
      const postData = [];
      data.forEach((obj) => {
        const tempObj = {
          active: true,
          emp_id: emp_ids,
          internal_id,
          present_status: obj.attendanceStatus ? "P" : "A",
          student_id: obj.student_id,
        };
        postData.push(tempObj);
      });
      await Promise.all([
        axios.post("/api/academic/internalAttendance", postData),
        axios.put(
          `/api/academic/internalStudentAssignment/${id}`,
          studentRoomAssignmentData
        ),
      ]);
      setAlertMessage({
        severity: "success",
        message: "Internal attendance has been recorded successfully.",
      });
      setAlertOpen(true);
      checkAttendanceStatus();
    } catch (err) {
      setAlertMessage({
        severity: "error",
        message:
          err.response?.data?.message ||
          "Failed to update attendance. Please try again.",
      });
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    setConfirmContent({
      title: "",
      message: "Would you like to confirm?",
      buttons: [
        { name: "Yes", color: "primary", func: handleCreate },
        { name: "No", color: "primary", func: () => {} },
      ],
    });
    setConfirmOpen(true);
  };

  const columns = [
    {
      field: "id",
      headerName: "Sl No",
      flex: 1,
    },
    { field: "auid", headerName: "AUID", flex: 1 },
    { field: "usn", headerName: "USN", flex: 1 },
    { field: "student_name", headerName: "Student Name", flex: 1 },
    {
      field: "Present",
      headerName: "Attendance",
      flex: 1,
      renderCell: (params) => (
        <IconButton onClick={() => handleChangeAttendance(params.row)}>
          <Avatar
            variant="square"
            sx={{
              backgroundColor: params.row.attendanceStatus
                ? "success.main"
                : "error.main",
              color: "headerWhite.main",
              width: 20,
              height: 20,
            }}
          >
            <Typography variant="subtitle2">
              {params.row.attendanceStatus ? "P" : "A"}
            </Typography>
          </Avatar>
        </IconButton>
      ),
    },
  ];

  return (
    <>
      <CustomModal
        open={confirmOpen}
        setOpen={setConfirmOpen}
        title={confirmContent.title}
        message={confirmContent.message}
        buttons={confirmContent.buttons}
      />

      <GridIndex
        rows={data}
        columns={columns}
        checkboxSelection
        disableSelectionOnClick
        selectionModel={selectionModel}
        onSelectionModelChange={handleSelectionChange}
      />

      <Grid item xs={12} align="right">
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || selectionModel.length === 0}
        >
          Submit
        </Button>
      </Grid>
    </>
  );
}

export default InternalAttendanceEntry;