import { Axios } from "../utils/axios";
import { BASE_URL } from '../config';

const axios = new Axios();

export const addBrand = async (data) => {
    const res = await axios.post(`${BASE_URL}brand/store`, data);
    return res.data
}
export const updateBrand = async (id,data) => {
    const res = await axios.patch(`${BASE_URL}brand/update/${id}`, data);
    return res.data
}
export const getBrand = async () => {
    const res = await axios.get(`${BASE_URL}brand/index`);
    return res.data.brand
}
export const deleteBrand = async (id) => {
    const res = await axios.delete(`${BASE_URL}brand/delete/${id}`);
    return res
}