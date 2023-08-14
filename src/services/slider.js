import { Axios } from "../utils/axios";
import { BASE_URL } from '../config';

const axios = new Axios();

export const addSlider = async (data) => {
    const res = await axios.post(`${BASE_URL}slider/store`, data);
    return res.data
}
export const updateSlider = async (id,data) => {
    const res = await axios.patch(`${BASE_URL}slider/update/${id}`, data);
    return res.data
}
export const getSlider = async () => {
    const res = await axios.get(`${BASE_URL}slider/index`);
    return res.data.slider
}
export const deleteSlider = async (id) => {
    const res = await axios.delete(`${BASE_URL}slider/delete/${id}`);
    return res
}