import { Axios } from "../utils/axios";
import { BASE_URL } from '../config';

const axios = new Axios();

export const login = async (data) => {
    const { data: logInData } = await axios.post(`${BASE_URL}admin/login`, data);
    console.log("hello",logInData)
    if (logInData) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...logInData.data
          })
        );
      }
}