import { Axios } from "../utils/axios";
import { BASE_URL } from '../config';

const axios = new Axios();

export const addCategory = async (data) => {
    const res = await axios.post(`${BASE_URL}category/store`, data);
    return res.data
}
export const getCategory = async () => {
    const res = await axios.get(`${BASE_URL}category/index`);
    return res.data.category
}
export const deleteCategory = async (id) => {
    const res = await axios.delete(`${BASE_URL}category/delete/${id}`);
    return res
}
export const updateCategory = async (id,data) => {
    const res = await axios.patch(`${BASE_URL}category/update/${id}`, data);
    return res.data
}