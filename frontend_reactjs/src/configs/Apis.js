import axios from "axios";
import cookie from "react-cookies";

export const BASE_URL = 'http://localhost:8080/api/';


export const endpoints = {
	login: '/auth/login',
	profile: '/secure/profile',
	"add-user": '/users/add',
}

export const authApis = () => {
	return axios.create({
		baseURL: BASE_URL,
		headers: {
            "Authorization": `Bearer ${cookie.load('token')}`,
            'Content-Type': 'application/json'
		}
	})

}

export default axios.create({
	baseURL: BASE_URL
});