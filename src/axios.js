import axios from "axios";

const instance = axios.create({
  baseURL:
    "http://ec2-3-110-134-159.ap-south-1.compute.amazonaws.com:8080/v1/app",
});

export default instance;
