import { Axios } from "../utils/axios";
import { BASE_URL } from '../config';

const axios = new Axios();

export const addMessage = async (data) => {
    const res = await axios.post(`${BASE_URL}contact/store`, data);
    return res.data
}
export const getMessage = async () => {
    const res = await axios.get(`${BASE_URL}contact/index`);
    return res.data.contactUs
}
export const deleteMessage = async (id) => {
    const res = await axios.delete(`${BASE_URL}contact/delete/${id}`);
    return res
}
export const updateMessage = async (id,data) => {
    const res = await axios.patch(`${BASE_URL}contact/update/${id}`, data);
    return res.data
}