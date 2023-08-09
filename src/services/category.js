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