import Axios from "axios";

// Local
const apiUrl = `https://456b-2401-4900-1f27-5868-15f9-f9fc-945-3303.ngrok-free.app`;

// Staging backend
// const apiUrl = `https://www.stageapi-acharyainstitutes.in`;
// const apiUrl = `http://ec2-15-206-202-184.ap-south-1.compute.amazonaws.com:8081/Acharya_University`;
// const apiUrl = `https://www.stageapi-acharyainstitutes.in/Acharya_University`;

const axios = Axios.create({
  baseURL: apiUrl,
});

export default axios;
