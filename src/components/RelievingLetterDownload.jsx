import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import moment from "moment";
import LetterheadImage from "../assets/aisait.jpg";
import RobotoBold from "../fonts/Roboto-Bold.ttf";
import RobotoItalic from "../fonts/Roboto-Italic.ttf";
import RobotoLight from "../fonts/Roboto-Light.ttf";
import RobotoRegular from "../fonts/Roboto-Regular.ttf";

// Registering the font family
Font.register({
  family: "Roboto",
  fonts: [
    { src: RobotoBold, fontStyle: "bold", fontWeight: 700 },
    { src: RobotoItalic, fontStyle: "italic", fontWeight: 200 },
    { src: RobotoLight, fontStyle: "light", fontWeight: 300 },
    { src: RobotoRegular, fontStyle: "normal" },
  ],
});

const styles = StyleSheet.create({
  start: { marginTop: 90 },
  page: {
    padding: 40,
    fontFamily: "Times-Roman",
    fontSize: 12,
    lineHeight: 1.5,
  },
  headerRight: {
    textAlign: "right",
    marginBottom: 20,
    fontSize: 12,
  },
  headerCenter: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 14,
    textDecoration: "underline",
    fontWeight: "bold",
    fontFamily: "Times-Bold",
  },
  bodyText: {
    marginTop: 15,
    fontSize: 12,
  },
  boldText: {
    fontWeight: "bold",
    fontFamily: "Times-Bold",
  },
  sectionSpacing: {
    marginBottom: 40,
  },
  sectionSpacingTop: {
    marginTop: 40,
  },
  image: { position: "absolute", width: "100%" },
  text: {
    marginBottom: 15,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
const getImage = (employeeDocuments) => {
  try {
    if (!employeeDocuments || !employeeDocuments.school_name_short) {
      throw new Error("schoolShortName is not defined");
    }
    return require(`../assets/${employeeDocuments?.org_type?.toLowerCase()}${employeeDocuments?.school_name_short?.toLowerCase()}.jpg`);
  } catch (error) {
    console.error(
      "Image not found for schoolShortName:",
      employeeDocuments?.school_name_short,
      "Error:",
      error.message
    );
    return LetterheadImage;
  }
}
export const DownloadCombinedPDF = (data) => {
  const CombinedPDF = () => (
    <Document>
      {/* Page 1: Relieving Order */}
      <Page size="A4" style={styles.page}>
        <Image style={styles.image} src={getImage(data)} />
        <View>
          <View style={styles.start}>
            <View style={styles.text}>
              <Text>{data.relieving_number}</Text>
              <Text>
                Date :{moment(data.relieving_date).format("DD/MM/YYYY")}
              </Text>
            </View>
          </View>
          <View>
            <Text style={styles.headerCenter}>RELIEVING ORDER</Text>
            <Text>Dear {data.employee_name},</Text>
            <Text style={styles.bodyText}>
              This is to acknowledge that your resignation from the position of{" "}
              {data.designation_name} in the {data.dept_name} at{" "}
              {data.school_name} has been accepted.
            </Text>
            <Text style={styles.bodyText}>
              In accordance with the resignation notice you provided, we confirm
              that you are relieved from all your duties and responsibilities
              with effect from the close of business hours on{" "}
              {moment(data.relieving_date).format("DD-MM-YYYY")}.
            </Text>
            <Text style={styles.bodyText}>
              We acknowledge your contributions during your tenure with us and
              wish you all the best in your future endeavors.
            </Text>
            <Text style={styles.bodyText}>
              Thank you once again for your services to {data.school_name}.
            </Text>
          </View>
          <View style={styles.sectionSpacingTop}>
            <Text>
              for <Text style={styles.boldText}>{data.school_name}</Text>
            </Text>
            {/* <Text style={styles.boldText}>PRINCIPAL</Text>
            <Text style={styles.boldText}>Head HR</Text> */}
          </View>
          <View style={styles.sectionSpacingTop}>
            <View style={styles.text}>
              <Text style={styles.boldText}>PRINCIPAL</Text>
              <Text style={styles.boldText}>Head HR</Text>
            </View>
          </View>

          <View style={styles.sectionSpacingTop}>
            <Text>Copy To:</Text>
            <Text>
              {data.employee_name}-{data.empcode}
            </Text>
            <Text>Principal Office</Text>
            <Text>Administration Office</Text>
            <Text>HR Department</Text>
          </View>
        </View>
      </Page>

      {/* Page 2: Experience Certificate */}
      <Page size="A4" style={styles.page}>
        <Image style={styles.image} src={getImage(data)} />
        <View style={styles.start}>
          <Text style={styles.headerCenter}>EXPERIENCE CERTIFICATE</Text>
          <View>
            <Text>
              This is to certify that {data.gender === "M" ? "Mr" : "Ms"}.{" "}
              {data.employee_name}, designated as {data.designation_name} in the
              Department of {data.dept_name}, was employed with{" "}
              {data.school_name} from{" "}
              {data.date_of_joining} to{" "}
              {moment(data.relieving_date).format("DD-MM-YYYY")}.
            </Text>
            <Text style={styles.bodyText}>
              During their tenure, {data.gender === "M" ? "Mr" : "Ms"}.{" "}
              {data.employee_name} demonstrated good and satisfactory
              performance in their role. They effectively contributed to the
              academic and administrative functions of the department.
            </Text>
            <Text style={styles.bodyText}>
              We wish them continued success in their future endeavors.
            </Text>
          </View>
          <View style={styles.sectionSpacingTop}>
            <Text>
              for <Text style={styles.boldText}>{data.school_name}</Text>
            </Text>
          </View>
          <View style={styles.sectionSpacingTop}>
            <Text style={styles.boldText}>Head HR</Text>
            <Text style={styles.boldText}>Human Resources Department</Text>
          </View>
        </View>
      </Page>
    </Document>
  );

  return new Promise(async (resolve, reject) => {
    try {
      const blob = await pdf(<CombinedPDF />).toBlob();
      resolve(blob);
    } catch (error) {
      reject(error);
    }
  });
};