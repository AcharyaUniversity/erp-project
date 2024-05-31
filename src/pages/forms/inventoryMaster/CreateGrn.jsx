import React from "react";
import { Grid, Button, CircularProgress, Paper } from "@mui/material";
import CustomTextField from "../../../components/Inputs/CustomTextField";
import { useState, useEffect } from "react";
import axios from "../../../services/Api";
import CustomDatePicker from "../../../components/Inputs/CustomDatePicker";
import CustomFileInput from "../../../components/Inputs/CustomFileInput";
import CustomAutocomplete from "../../../components/Inputs/CustomAutocomplete";
import useAlert from "../../../hooks/useAlert";
import useBreadcrumbs from "../../../hooks/useBreadcrumbs";
import FormWrapper from "../../../components/FormWrapper";
import { useNavigate, useParams } from "react-router-dom";

const initialValues = {
  isLibrary: "false",
  invoiceNo: "",
  invoiceDate: null,
  fileName: "",
  Store: "",
  remarks: "",
  poReferenceNo: "",
};

const initialValuesTwo = {
  itemId: null,
  itemDescription: "",
  rate: "",
  quantity: "",
  discount: "",
  gst: "",
  totalAmount: "",
  actualAmount: "",
  mainDiscount: "",
  cost: "",
  enterQuantity: "",
  description: "",
  itemNameWithDescription: "",
};

const CreateGrn = () => {
  const [values, setValues] = useState(initialValues);
  const [valuesTwo, setValuesTwo] = useState([initialValuesTwo]);
  const [StoreOptions, setStoreOptions] = useState([]);

  const { setAlertMessage, setAlertOpen } = useAlert();
  const [loading, setLoading] = useState(false);
  const setCrumbs = useBreadcrumbs();
  const { id } = useParams();

  useEffect(() => {
    getPoData();
  }, []);

  const getPoData = async () => {
    await axios
      .get(`/api/purchase/getPurchaseOrderById?id=${id}`)
      .then((res) => {
        setValues({
          vendorId: res.data.data?.purchaseOrder.vendorId,
          quotationNo: res.data.data?.purchaseOrder.quotationNo,
          destination: res.data.data?.purchaseOrder.destination,
          accountPaymentType: res.data.data?.purchaseOrder.accountPaymentType,
          requestType: res.data.data?.purchaseOrder.requestType,
          termsAndConditions: res.data.data?.purchaseOrder.termsAndConditions,
          destination: res.data.data?.purchaseOrder.destination,
          otherReferences: res.data.data?.purchaseOrder.otherReference,
          vendor: res.data.data?.purchaseOrder.vendor,
          institute: res.data.data?.purchaseOrder.institute,
          instituteId: res.data.data?.purchaseOrder.instituteId,
          poReferenceNo: res.data.data?.purchaseOrder.poReferenceNo,
        });
        const temp = [];

        res.data.data?.purchaseOrder?.purchaseItems.map((obj) => {
          temp.push({
            tempItemId: obj.purchase_item_id,
            balanceQuantity: obj.balanceQuantity,
            rate: obj.rate,
            quantity: obj.quantity,
            gst: obj.gst,
            discount: obj.discount,
            totalAmount: obj.totalAmount,
            itemNameWithDescription: obj.itemName,
            itemId: obj?.envItemsInStoresId?.env_item_id,
            cost: obj.costTotal,
            gstValue: obj.gstTotal,
            mainDiscount: obj.discountTotal,
          });
        });

        setValuesTwo(temp);

        setCrumbs([{ name: "GRN", link: "/PoMaster" }]);
      })
      .catch((err) => console.error(err));
  };

  const getStoreData = async () => {
    await axios
      .get(
        `/api/inventory/allStoresStockDetails?page=${0}&pageSize=${10000}&sort=created_date`
      )
      .then((res) => {
        setStoreOptions(
          res.data.data.Paginated_data.content.map((obj) => ({
            value: obj.stock_type_name,
            label: obj.stock_type_name,
            id: obj.id,
            storeid: obj.id,
          }))
        );
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    getStoreData();
  }, []);

  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const isRowsValid = valuesTwo.some(
      (row) => row.enterQuantity && row.description
    );

    const isMainFormValid = values.invoiceNo;

    const isFileValid = values.fileName && values.fileName !== null;

    setIsFormValid(isRowsValid && isMainFormValid && isFileValid);
  }, [values, valuesTwo]);

  const navigate = useNavigate();
  const userId = JSON.parse(localStorage.getItem("AcharyaErpUser"))?.userId;
  const userName = JSON.parse(localStorage.getItem("AcharyaErpUser"))?.userName;

  const handleChangeRemarksInvoiceNO = (e) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleChangeAdvance = (name, newValue) => {
    const selectedStore = StoreOptions.find(
      (store) => store.value === newValue
    );

    setValues((prev) => ({
      ...prev,
      [name]: newValue,

      storeId: selectedStore?.storeid,
      storeName: selectedStore?.label,
    }));
  };

  const handleChangeDate = (name, newValue) => {
    setValues((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleFileDrop = (name, newFile) => {
    if (newFile) {
      setValues((prev) => ({
        ...prev,
        [name]: newFile,
      }));
    }
  };

  const handleFileRemove = (name) => {
    setValues((prev) => ({
      ...prev,
      [name]: null,
    }));
  };

  const handleChangeItems = (e, index) => {
    setValuesTwo((prev) =>
      prev.map((obj, i) => {
        if (index === i) {
          const gstValue = e.target.value * obj.rate * (obj.gst / 100);
          const actualValue = e.target.value * obj.rate;
          const discountedValue = (actualValue * obj.discount) / 100;
          const finalAmount = actualValue - discountedValue + gstValue;

          return {
            ...obj,
            [e.target.name]:
              Number(e.target.value) > Number(obj.balanceQuantity)
                ? obj.balanceQuantity
                : e.target.value,
            ["totalAmount"]: finalAmount,
            ["gstValue"]: gstValue,
            ["mainDiscount"]: discountedValue,
            ["cost"]: actualValue ? actualValue : e.target.value,
          };
        } else {
          return obj;
        }
      })
    );
  };

  const handleChangeDescription = (e, index) => {
    setValuesTwo((prev) =>
      prev.map((obj, i) => {
        if (index === i) {
          return {
            ...obj,
            [e.target.name]:
              Number(e.target.value) > Number(obj.balanceQuantity)
                ? obj.balanceQuantity
                : e.target.value,
          };
        } else {
          return obj;
        }
      })
    );
  };

  const handleCreate = async () => {
    setLoading(true);
    const temp = {};
    const tempOne = [];
    const tempTwo = [];
    temp.active = true;
    temp.vendorId = values.vendorId;
    temp.vendor = values.vendor;
    temp.storeName = values.storeName;
    temp.remarks = values.remarks;
    temp.quotationNo = values.quotationNo;
    temp.noOfDays = values.noOfDays;
    temp.accountPaymentType = values.accountPaymentType;
    temp.requestType = values.requestType;
    temp.termsAndConditions = values.termsAndConditions;
    temp.destination = values.destination;
    temp.otherReference = values.otherReferences;
    temp.instituteId = values.instituteId;
    temp.institute = values.institute;
    temp.userId = userId;
    temp.userName = userName;
    temp.storeId = values.storeId;
    temp.poNo = values.poReferenceNo;
    temp.invoiceNo = values.invoiceNo;
    temp.invoiceDate = values.invoiceDate;
    valuesTwo.map((obj) => {
      if (obj.enterQuantity !== undefined)
        tempOne.push({
          costTotal: obj.cost,
          discount: obj.discount,
          gst: obj.gst,
          quantity: obj.quantity,
          rate: parseFloat(obj.rate),
          balanceQuantity: obj.balanceQuantity - obj.enterQuantity,
          totalAmount: obj.totalAmount,
          itemName: obj.itemNameWithDescription,
          envItemsInStoresId: obj.itemId,
          discountTotal: obj.mainDiscount,
          gstTotal: obj.gstValue,
          enterQuantity: obj.enterQuantity,
          isLibrary: false,
          uom: obj?.itemNameWithDescription.split("-")[3],
        });
    });

    valuesTwo.map((obj) => {
      if (obj.enterQuantity !== undefined)
        tempTwo.push({
          purchaseItemId: obj.tempItemId,
          costTotal: obj.cost,
          discount: obj.discount,
          gst: obj.gst,
          quantity: obj.quantity,
          rate: parseFloat(obj.rate),
          balanceQuantity: obj.balanceQuantity - obj.enterQuantity,
          totalAmount: obj.totalAmount,
          itemName: obj.itemNameWithDescription,
          envItemsInStoresId: obj.itemId,
          discountTotal: obj.mainDiscount,
          gstTotal: obj.gstValue,
          descriptionAsperInvoice: obj.description,
          enterQuantity: obj.enterQuantity,
          isLibrary: false,
          value: obj.totalAmount,
          purchaseOrderId: id,
        });
    });

    temp.directGrnDTOs = tempOne;
    temp.grnProducts = tempTwo;

    await axios
      .post(`/api/purchase/createGrn`, temp)
      .then(async (res) => {
        const grn_no = res.data.data;
        if (res.status === 200 || res.status === 201) {
          const formData = new FormData();
          formData.append("file", values.fileName);

          await axios
            .post(
              `/api/purchase/uploadGrnFile?grn_no=${res.data.data}`,
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            )
            .then((res) => {
              setAlertMessage({
                severity: "success",
                message: "Form Updated Successfully",
              });
              setLoading(false);
              navigate("/CreatedGRN", { state: { StockNo: grn_no } });
            })
            .catch((err) => {
              setLoading(false);
              setAlertMessage({
                severity: "error",
                message: "Error in uploading file",
              });
            });
        } else {
          setLoading(false);
          setAlertMessage({
            severity: "error",
            message: res.data.message,
          });
        }
        setAlertOpen(true);
      })
      .catch((error) => {
        setLoading(false);
        setAlertMessage({
          severity: "error",
          message: error.response ? error.response.data.message : "Error",
        });
        setAlertOpen(true);
      });
  };

  return (
    <FormWrapper>
      <>
        <Grid
          item
          xs={12}
          component={Paper}
          rowSpacing={2}
          elevation={3}
          p={2}
          marginTop={1}
        >
          <Grid container rowSpacing={1.5} columnSpacing={2}>
            {valuesTwo?.map((obj, i) => {
              return (
                <>
                  <Grid item xs={12} md={3} key={i}>
                    <CustomTextField
                      label="Inventory"
                      value={obj.itemNameWithDescription}
                      handleChange={(e) => handleChangeItems(e, i)}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={1.8}>
                    <CustomTextField
                      label="Quantity"
                      value={obj.quantity}
                      handleChange={(e) => handleChangeItems(e, i)}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={1.8}>
                    <CustomTextField
                      label="Rate"
                      value={obj.rate}
                      handleChange={(e) => handleChangeItems(e, i)}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={1.8}>
                    <CustomTextField
                      label="Balance Qty"
                      value={obj.balanceQuantity ?? obj.quantity}
                      handleChange={(e) => handleChangeItems(e, i)}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <CustomTextField
                      name="enterQuantity"
                      value={obj.enterQuantity}
                      label="Enter Qty"
                      handleChange={(e) => handleChangeItems(e, i)}
                    />
                  </Grid>
                  <Grid item xs={12} md={2.6}>
                    <CustomTextField
                      name="description"
                      value={obj.description}
                      label="Description"
                      handleChange={(e) => handleChangeDescription(e, i)}
                    />
                  </Grid>
                </>
              );
            })}
          </Grid>
        </Grid>

        <Grid
          container
          justifyContent="flex-start"
          alignItems="center"
          rowSpacing={2}
          columnSpacing={2}
          mt={4}
        >
          <Grid item xs={12} md={3}>
            <CustomTextField
              name="invoiceNo"
              label="Invoice No"
              value={values.invoiceNo}
              handleChange={handleChangeRemarksInvoiceNO}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} md={3} mt={2.2}>
            <CustomDatePicker
              name="invoiceDate"
              label="Invoice Date*"
              value={values.invoiceDate ? values.invoiceDate : null}
              handleChangeAdvance={handleChangeDate}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <CustomTextField
              multiline
              rows={2}
              label="Remarks"
              name="remarks"
              inputProps={{
                maxLength: 300,
              }}
              value={values.remarks}
              handleChange={handleChangeRemarksInvoiceNO}
            />
          </Grid>
          {values?.requestType === "GRN" ? (
            <Grid item xs={12} md={3}>
              <CustomAutocomplete
                name="Store"
                label="Store"
                value={values.Store}
                options={StoreOptions}
                handleChangeAdvance={handleChangeAdvance}
                required
              />
            </Grid>
          ) : (
            <></>
          )}

          <Grid item xs={12} md={3}>
            <CustomFileInput
              name="fileName"
              label="File"
              helperText="JPG - smaller than 2 MB"
              file={values.fileName}
              handleFileDrop={handleFileDrop}
              handleFileRemove={handleFileRemove}
            />
          </Grid>
          <Grid item xs={12} mt={1} align="right">
            <Button
              color="success"
              variant="contained"
              sx={{ borderRadius: 2 }}
              onClick={handleCreate}
              disabled={!isFormValid || loading}
            >
              {loading ? (
                <CircularProgress
                  size={25}
                  color="blue"
                  style={{ margin: "2px 13px" }}
                />
              ) : (
                <strong>{"Submit"}</strong>
              )}
            </Button>
          </Grid>
        </Grid>
      </>
    </FormWrapper>
  );
};

export default CreateGrn;
