import { React, useState, useEffect } from "react";
import { Grid, Button, CircularProgress, Box } from "@mui/material";

import CustomTextField from "../../components/Inputs/CustomTextField";
import axios from "axios";
import ApiUrl from "../../services/Api";

import { useNavigate, useParams, useLocation } from "react-router-dom";
import CustomAutocomplete from "../../components/Inputs/CustomAutocomplete";
import useAlert from "../../hooks/useAlert";
import useBreadcrumbs from "../../hooks/useBreadcrumbs";
import FormWrapper from "../../components/FormWrapper";

const initialValues = {
  programSpeName: "",
  shortName: "",
  auid: "",
  acYearId: "",
  schoolId: "",
  programId: "",
  deptId: "",
};
const requiredFields = [
  "programSpeName",
  "shortName",
  "acYearId",
  "schoolId",
  "programId",
  "deptId",
];

function ProgramSpecializationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const setCrumbs = useBreadcrumbs();
  const [isNew, setIsNew] = useState(true);
  const [values, setValues] = useState(initialValues);
  const [formValid, setFormValid] = useState({});
  const [programAssignmentId, setProgramAssignmentId] = useState(null);
  const { setAlertMessage, setAlertOpen } = useAlert();
  const [loading, setLoading] = useState(false);
  const [academicData, setAcademicData] = useState([]);
  const [schoolData, setSchoolData] = useState([]);
  const [programData, setProgramData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);

  useEffect(() => {
    getAcademicyear();
    getSchool();
    if (
      pathname.toLowerCase() === "/academicmaster/programspecialization/new"
    ) {
      setIsNew(true);
      requiredFields.forEach((keyName) => {
        setFormValid((prev) => ({ ...prev, [keyName]: false }));
      });
      setCrumbs([
        { name: "AcademicMaster", link: "/AcademicMaster" },
        { name: "Specialization" },
        { name: "Create" },
      ]);
    } else {
      setIsNew(false);
      getProgramSpecializationData();
      requiredFields.forEach((keyName) => {
        setFormValid((prev) => ({ ...prev, [keyName]: true }));
      });
    }
  }, []);

  const getProgramSpecializationData = async () => {
    await axios
      .get(`${ApiUrl}/academic/ProgramSpecilization/${id}`)
      .then((res) => {
        setValues({
          programSpeName: res.data.data.program_specialization_name,
          shortName: res.data.data.program_specialization_short_name,
          auid: res.data.data.auid_format,
          acYearId: res.data.data.ac_year_id,
          schoolId: res.data.data.school_id,
          programId: res.data.data.program_id,
          deptId: res.data.data.dept_id,
        });
        axios
          .get(`${ApiUrl}/fetchdept1/${res.data.data.school_id}`)
          .then((res) => {
            setDepartmentData(
              res.data.data.map((obj) => ({
                value: obj.dept_id,
                label: obj.dept_name,
              }))
            );
          });
        axios
          .get(`${ApiUrl}/academic/fetchProgram1/${res.data.data.school_id}`)
          .then((res) => {
            setProgramData(
              res.data.data.map((obj) => ({
                value: obj.program_id,
                label: obj.program_name,
              }))
            );
          });
        setProgramAssignmentId(res.data.data.program_specialization_id);
        setCrumbs([
          { name: "AcademicMaster", link: "/AcademicMaster" },
          { name: "Specialization" },
          { name: "Update" },
          { name: res.data.data.program_specialization_name },
        ]);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const getAcademicyear = () => {
    axios
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

  const getSchool = () => {
    axios
      .get(`${ApiUrl}/institute/school`)
      .then((res) => {
        setSchoolData(
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

  const handleSchool = (event, val) => {
    setValues((prev) => ({ ...prev, schoolId: val }));
    axios
      .get(`${ApiUrl}/fetchdept1/${val}`)
      .then((res) => {
        setDepartmentData(
          res.data.data.map((obj) => ({
            value: obj.dept_id,
            label: obj.dept_name,
          }))
        );
      })
      .catch((error) => {
        console.error(error);
      });
    axios
      .get(`${ApiUrl}/academic/fetchProgram1/${val}`)
      .then((res) => {
        setProgramData(
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

  const handleChange = (e) => {
    if (e.target.name === "shortName") {
      setValues((prev) => ({
        ...prev,
        [e.target.name]: e.target.value.toUpperCase(),
      }));
    } else if (e.target.name === "auid") {
      setValues((prev) => ({
        ...prev,
        [e.target.name]: e.target.value.toUpperCase(),
      }));
    } else {
      setValues((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    }
  };
  const handleChangeAdvance = (name, newValue) => {
    setValues((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

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
      temp.program_specialization_name = values.programSpeName;
      temp.program_specialization_short_name = values.shortName;
      temp.auid_format = values.auid;
      temp.ac_year_id = values.acYearId;
      temp.school_id = values.schoolId;
      temp.program_id = values.programId;
      temp.dept_id = values.deptId;

      await axios
        .post(`${ApiUrl}/academic/ProgramSpecilization`, temp)
        .then((response) => {
          console.log(response);
          setAlertMessage({
            severity: "success",
            message: "Form Submitted Successfully",
          });
          setAlertOpen(true);
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
      temp.program_specialization_id = programAssignmentId;
      temp.program_specialization_name = values.programSpeName;
      temp.program_specialization_short_name = values.shortName;
      temp.auid_format = values.auid;
      temp.ac_year_id = values.acYearId;
      temp.school_id = values.schoolId;
      temp.program_id = values.programId;
      temp.dept_id = values.deptId;
      await axios
        .put(`${ApiUrl}/academic/ProgramSpecilization/${id}`, temp)
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
                <CustomTextField
                  name="programSpeName"
                  label="Program Specialization"
                  value={values.programSpeName}
                  handleChange={handleChange}
                  fullWidth
                  errors={["This field required"]}
                  checks={[values.programSpeName !== ""]}
                  setFormValid={setFormValid}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomTextField
                  name="shortName"
                  label="Short Name"
                  value={values.shortName}
                  handleChange={handleChange}
                  fullWidth
                  errors={[
                    "This field required",
                    "Enter characters length between 3 to 4",
                  ]}
                  checks={[
                    values.shortName !== "",
                    /^[A-Za-z ]{3,4}$/.test(values.shortName),
                  ]}
                  setFormValid={setFormValid}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomTextField
                  name="auid"
                  label="AUID Format"
                  value={values.auid}
                  handleChange={handleChange}
                  inputProps={{
                    minLength: 4,
                    maxLength: 4,
                  }}
                  errors={[
                    "This field required",
                    "Enter characters and its length should be four",
                  ]}
                  checks={[
                    values.auid !== "",
                    /^[A-Za-z ]{4}$/.test(values.auid),
                  ]}
                  fullWidth
                />
              </Grid>
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
                  value={values.schoolId}
                  label="School"
                  options={schoolData}
                  handleChangeAdvance={handleSchool}
                  setFormValid={setFormValid}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomAutocomplete
                  name="programId"
                  label="Program"
                  value={values.programId}
                  options={programData}
                  handleChangeAdvance={handleChangeAdvance}
                  setFormValid={setFormValid}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomAutocomplete
                  name="deptId"
                  label="Department"
                  value={values.deptId}
                  options={departmentData}
                  handleChangeAdvance={handleChangeAdvance}
                  setFormValid={setFormValid}
                  required
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
export default ProgramSpecializationForm;
