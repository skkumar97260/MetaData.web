import API from "./api";
import { user } from "./endpoints";

export const getUser = (data) => {
    return API.get(`${user}/`,data);
}