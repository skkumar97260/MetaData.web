import axios from "axios";
import { clearStorage } from "../utils/Storage";

const API = axios.create({ baseURL: "http://localhost:5000/api/" });

API.interceptors.request.use(
  (request) => {
    const token = localStorage.getItem("token");
    const basicAuth =
      `Basic ` +
      btoa(
        "sivakumar:Sk@279200"
      );
    request.headers.authorization = basicAuth;
    if (token) {
      request.headers.token = `Bearer ${token}`;
    }
    return request;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      clearStorage();
      window.location.pathname = "/";
    }
    return Promise.reject(error);
  }
);

export default API;
