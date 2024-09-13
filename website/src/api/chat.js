import API from "./api";
import { chat } from "./endpoints";

export const userSendMessage = (data) => {
    return API.post(`${chat}/`, data);
}
export const getChat = (data) => {
    return API.get(`${chat}/chat`, data);
}