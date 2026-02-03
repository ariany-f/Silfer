import axios from 'axios';
import axiosInterceptor from './axiosInterceptor';
import {environment} from './environment';

const wampServer = environment.URL + '/api/';
const axiosApi = axios.create({
    baseURL: wampServer,
    withCredentials: true, // Importante para CSRF token e cookies
});

axiosInterceptor.setupInterceptors(axiosApi, true, false);
export default axiosApi;
