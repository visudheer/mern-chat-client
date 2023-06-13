import axios from "axios";

const instance = axios.create({
  baseURL:
    "http://ec2-65-0-130-92.ap-south-1.compute.amazonaws.com:8080/v1/app/",
});

export default instance;
