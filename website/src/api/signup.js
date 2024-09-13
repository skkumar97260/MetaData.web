import API from "./api";
import {signup} from "./endpoints"
export const signupuser = (data) => {
    return API.post(`${signup}/`, data);
}

export const verifyOtp = (data) => {
     return API.post(`${signup}/verifyOtp`, data);
}