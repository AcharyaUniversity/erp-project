import { React, useState, useEffect } from "react";
import { Box, Grid, Button, CircularProgress } from "@mui/material";
import FormWrapper from "../../components/FormWrapper";
import CustomTextField from "../../components/Inputs/CustomTextField";
import axios from "axios";
import ApiUrl from "../../services/Api";
import useAlert from "../../hooks/useAlert";
import { useNavigate } from "react-router-dom";
import CustomAutocomplete from "../../components/Inputs/CustomAutocomplete";
const initialValues = {
  ledgerName: "",
  ledgerShortName: "",
  groupId: "",
  priority: "",
  remarks: "",
};

function LedgerCreation() {
  useEffect(() => {
    getGroup();
  }, []);

  const [data, setData] = useState(initialValues);
  const [formValid, setFormValid] = useState({
    ledgerName: false,
    ledgerShortName: false,
  });

  const navigate = useNavigate();
  const { setAlertMessage, setAlertOpen } = useAlert();

  const [loading, setLoading] = useState(false);
  const [group, setGroup] = useState([]);
  const getGroup = async () => {
    axios.get(`${ApiUrl}/group`).then((res) => {
      setGroup(
        res.data.data.map((obj) => ({
          value: obj.group_id,
          label: obj.group_name,
        }))
      );
    });
  };
  const handleChangeAdvance = (name, newValue) => {
    setData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };
  const handleChange = (e) => {
    if (e.target.name === "ledgerShortName") {
      setData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value.toUpperCase(),
      }));
    } else {
      setData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.values(formValid).includes(false)) {
      setAlertMessage({
        severity: "error",
        message: "Please fill all fields",
      });
      setAlertOpen(true);
      console.log("failed");
    } else {
      const temp = {};
      temp.active = true;
      temp.ledger_name = data.ledgerName;
      temp.ledger_short_name = data.ledgerShortName;
      temp.group_id = data.groupId;
      temp.priority = data.priority;
      temp.remarks = data.remarks;
      await axios
        .post(`${ApiUrl}/finance/Ledger`, temp)
        .then((response) => {
          setLoading(true);
          setAlertMessage({
            severity: "success",
            message: "Data inserted Successfully",
          });
          setAlertOpen(true);
          navigate("/AccountMaster", { replace: true });
        })
        .catch((error) => {
          setLoading(false);
          setAlertMessage({
            severity: "error",
            message: error.response ? error.response.data.message : "Error",
          });
          setAlertOpen(true);
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
                  name="ledgerName"
                  label="Ledger Name"
                  value={data.ledgerName ?? ""}
                  handleChange={handleChange}
                  fullWidth
                  errors={["This field required", "Enter Only Characters"]}
                  checks={[
                    data.ledgerName !== "",
                    /^[A-Za-z ]+$/.test(data.ledgerName),
                  ]}
                  setFormValid={setFormValid}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomTextField
                  name="ledgerShortName"
                  label="Short Name"
                  value={data.ledgerShortName ?? ""}
                  inputProps={{
                    minLength: 3,
                    maxLength: 3,
                  }}
                  handleChange={handleChange}
                  fullWidth
                  errors={[
                    "This field required",
                    "Enter characters and its length should be three",
                  ]}
                  checks={[
                    data.ledgerShortName !== "",
                    /^[A-Za-z ]{3}$/.test(data.ledgerShortName),
                  ]}
                  setFormValid={setFormValid}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomAutocomplete
                  name="groupId"
                  label="Group"
                  value={data.groupId}
                  options={group}
                  handleChangeAdvance={handleChangeAdvance}
                  setFormValid={setFormValid}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomTextField
                  type="number"
                  label="Priority"
                  name="priority"
                  value={data.priority ?? ""}
                  handleChange={handleChange}
                  fullWidth
                  setFormValid={setFormValid}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomTextField
                  multiline
                  rows={4}
                  label="Remarks"
                  name="remarks"
                  value={data.remarks}
                  handleChange={handleChange}
                  fullWidth
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
                      onClick={handleSubmit}
                    >
                      {loading ? (
                        <CircularProgress
                          size={25}
                          color="blue"
                          style={{ margin: "2px 13px" }}
                        />
                      ) : (
                        <strong>Submit</strong>
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
export default LedgerCreation;
