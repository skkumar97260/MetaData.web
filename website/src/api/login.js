import API from "./api";
import  {login} from "./endpoints";
export const loginuser = (data) => {
    return API.post(`${login}/`, data);
}

export const verifyOtp = (data) => {
    return API.post(`${login}/verifyOtp`, data);
}