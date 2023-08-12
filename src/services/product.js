import { Axios } from "../utils/axios";
import { BASE_URL } from '../config';

const axios = new Axios();

export const addProduct = async (data) => {
    const res = await axios.post(`${BASE_URL}product/store`, data);
    return res.data
}
export const getProduct = async () => {
    const res = await axios.get(`${BASE_URL}product/index`);
    return res.data.product
}
export const deleteProduct = async (id) => {
    const res = await axios.delete(`${BASE_URL}product/delete/${id}`);
    return res
}