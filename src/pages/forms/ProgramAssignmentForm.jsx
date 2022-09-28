import { React, useState, useEffect } from "react";
import { Grid, Button, CircularProgress, Box } from "@mui/material";

import CustomTextField from "../../components/Inputs/CustomTextField";
import axios from "axios";
import ApiUrl from "../../services/Api";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CustomAutocomplete from "../../components/Inputs/CustomAutocomplete";
import useAlert from "../../hooks/useAlert";
import useBreadcrumbs from "../../hooks/useBreadcrumbs";
import FormWrapper from "../../components/FormWrapper";

const initialValues = {
  acYearId: "",
  schoolId: "",
  programId: "",
  programTypeId: "",
  graduationId: "",
  numberOfYears: "",
  numberOfSemester: "",
};
const requiredFields = [
  "acYearId",
  "schoolId",
  "programId",
  "programTypeId",
  "graduationId",
  "numberOfYears",
];
function ProgramAssignmentForm() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const [isNew, setIsNew] = useState(true);
  const [values, setValues] = useState(initialValues);
  const [formValid, setFormValid] = useState({});

  const { setAlertMessage, setAlertOpen } = useAlert();
  const setCrumbs = useBreadcrumbs();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [programAssigmentId, setProgramAssignmentId] = useState(null);
  const [academicData, setAcademicData] = useState([]);
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [programOptions, setProgramOptions] = useState([]);
  const [graduationOptions, setGraduationOptions] = useState([]);
  const [programtypeOptions, setProgramtypeOptions] = useState([]);

  useEffect(() => {
    getAcademicyear();
    getSchool();
    getProgram();
    getGraduation();
    getProgramType();
    if (pathname.toLowerCase() === "/academicmaster/programassignment/new") {
      setIsNew(true);
      requiredFields.forEach((keyName) => {
        setFormValid((prev) => ({ ...prev, [keyName]: false }));
      });
      setCrumbs([
        { name: "AcademicMaster", link: "/AcademicMaster" },
        { name: "Assignment" },
        { name: "Create" },
      ]);
    } else {
      setIsNew(false);
      getProgramAssignmentData();
      requiredFields.forEach((keyName) => {
        setFormValid((prev) => ({ ...prev, [keyName]: true }));
      });
    }
  }, []);

  const getAcademicyear = async () => {
    await axios
      .get(`${ApiUrl}/academic/academic_year`)
      .then((res) => {
        setAcademicData(
          res.data.data.map((obj) => ({
            value: obj.ac_year_id,
            label: obj.ac_year,
          }))
        );
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const getSchool = async () => {
    await axios
      .get(`${ApiUrl}/institute/school`)
      .then((res) => {
        setSchoolOptions(
          res.data.data.map((obj) => ({
            value: obj.school_id,
            label: obj.school_name,
          }))
        );
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const getProgram = async () => {
    await axios
      .get(`${ApiUrl}/academic/Program`)
      .then((res) => {
        setProgramOptions(
          res.data.data.map((obj) => ({
            value: obj.program_id,
            label: obj.program_name,
          }))
        );
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const getGraduation = async () => {
    await axios
      .get(`${ApiUrl}/employee/graduation`)
      .then((res) => {
        setGraduationOptions(
          res.data.data.map((obj) => ({
            value: obj.graduation_id,
            label: obj.graduation_name,
          }))
        );
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const getProgramType = async () => {
    await axios
      .get(`${ApiUrl}/academic/ProgramType`)
      .then((res) => {
        setProgramtypeOptions(
          res.data.data.map((obj) => ({
            value: obj.program_type_id,
            label: obj.program_type_name,
          }))
        );
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const getProgramAssignmentData = async () => {
    await axios.get(`${ApiUrl}/academic/ProgramAssigment/${id}`).then((res) => {
      setValues({
        acYearId: res.data.data.ac_year_id,
        schoolId: res.data.data.school_id,
        programId: res.data.data.program_id,
        programTypeId: res.data.data.program_type_id,
        graduationId: res.data.data.graduation_id,
        numberOfYears: res.data.data.number_of_years,
        numberOfSemester: res.data.data.number_of_semester,
      });
      setProgramAssignmentId(res.data.data.program_assignment_id);
      setCrumbs([
        { name: "AcademicMaster", link: "/AcademicMaster" },
        { name: "Assignment" },
        { name: "Update" },
        { name: "" },
      ]);
    });
  };

  const handleChangeAdvance = (name, newValue) => {
    setValues((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };
  function handleChange(e) {
    setValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
      numberOfSemester: 2 * e.target.value,
    }));
  }
  const handleCreate = async (e) => {
    if (Object.values(formValid).includes(false)) {
      setAlertMessage({
        severity: "error",
        message: "Please fill required fields",
      });
      console.log("failed");
      setAlertOpen(true);
    } else {
      const temp = {};
      temp.active = true;
      temp.ac_year_id = values.acYearId;
      temp.school_id = values.schoolId;
      temp.program_id = values.programId;
      temp.program_type_id = values.programTypeId;
      temp.graduation_id = values.graduationId;
      temp.number_of_years = values.numberOfYears;
      temp.number_of_semester = values.numberOfSemester;

      await axios
        .post(`${ApiUrl}/academic/ProgramAssigment`, temp)
        .then((response) => {
          setAlertMessage({
            severity: "success",
            message: "Form Submitted Successfully",
          });
          navigate("/AcademicMaster", { replace: true });
        })
        .catch((error) => {
          setAlertMessage({
            severity: "error",
            message: error.response ? error.response.data.message : "Error",
          });
          setAlertOpen(true);
        });
    }
  };
  const handleUpdate = async (e) => {
    if (Object.values(formValid).includes(false)) {
      setAlertMessage({
        severity: "error",
        message: "Please fill required fields",
      });
      console.log("failed");
      setAlertOpen(true);
    } else {
      const temp = {};
      temp.active = true;
      temp.program_assignment_id = programAssigmentId;
      temp.ac_year_id = values.acYearId;
      temp.school_id = values.schoolId;
      temp.program_id = values.programId;
      temp.program_type_id = values.programTypeId;
      temp.graduation_id = values.graduationId;
      temp.number_of_years = values.numberOfYears;
      temp.number_of_semester = values.numberOfSemester;
      await axios
        .put(`${ApiUrl}/academic/ProgramAssigment/${id}`, temp)
        .then((response) => {
          setLoading(true);
          if (response.status === 200) {
            setAlertMessage({
              severity: "success",
              message: "Form Updated Successfully",
            });
            navigate("/AcademicMaster", { replace: true });
          } else {
            setAlertMessage({
              severity: "error",
              message: response.data.message,
            });
          }
          setAlertOpen(true);
        })
        .catch((error) => {
          setLoading(false);
          setAlertMessage({
            severity: "error",
            message: error.response.data.message,
          });
        });
    }
  };

  return (
    <>
      <Box component="form" overflow="hidden" p={1}>
        <FormWrapper>
          <Grid
            container
            alignItems="center"
            justifyContent="flex-start"
            rowSpacing={2}
            columnSpacing={{ xs: 2, md: 4 }}
          >
            <>
              <Grid item xs={12} md={6}>
                <CustomAutocomplete
                  name="acYearId"
                  label="Academic Year"
                  value={values.acYearId}
                  options={academicData}
                  handleChangeAdvance={handleChangeAdvance}
                  setFormValid={setFormValid}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomAutocomplete
                  name="schoolId"
                  label="School"
                  value={values.schoolId}
                  options={schoolOptions}
                  handleChangeAdvance={handleChangeAdvance}
                  setFormValid={setFormValid}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomAutocomplete
                  name="programId"
                  label="Program"
                  value={values.programId}
                  options={programOptions}
                  handleChangeAdvance={handleChangeAdvance}
                  setFormValid={setFormValid}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomAutocomplete
                  name="graduationId"
                  label="Graduation"
                  value={values.graduationId}
                  options={graduationOptions}
                  handleChangeAdvance={handleChangeAdvance}
                  setFormValid={setFormValid}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomAutocomplete
                  name="programTypeId"
                  label="Program Pattern"
                  value={values.programTypeId}
                  options={programtypeOptions}
                  handleChangeAdvance={handleChangeAdvance}
                  setFormValid={setFormValid}
                  required
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <CustomTextField
                  name="numberOfYears"
                  label="Number Of Year"
                  value={values.numberOfYears}
                  handleChange={handleChange}
                  errors={["This field required"]}
                  checks={[values.numberOfYears !== ""]}
                  setFormValid={setFormValid}
                  required
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <CustomTextField
                  name="numberOfSemester"
                  label="Number Of Semester"
                  handleChange={handleChange}
                  value={values.numberOfSemester ?? ""}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <Grid
                  container
                  alignItems="center"
                  justifyContent="flex-end"
                  textAlign="right"
                >
                  <Grid item xs={2}>
                    <Button
                      style={{ borderRadius: 7 }}
                      variant="contained"
                      color="primary"
                      disabled={loading}
                      onClick={isNew ? handleCreate : handleUpdate}
                    >
                      {loading ? (
                        <CircularProgress
                          size={25}
                          color="blue"
                          style={{ margin: "2px 13px" }}
                        />
                      ) : (
                        <strong>{isNew ? "Create" : "Update"}</strong>
                      )}
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </>
          </Grid>
        </FormWrapper>
      </Box>
    </>
  );
}
export default ProgramAssignmentForm;
