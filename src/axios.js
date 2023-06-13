import axios from "axios";

const instance = axios.create({
  baseURL: "http://13.200.64.48:8080/v1/app/",
});

export default instance;
