import axios from 'axios';
import axiosInterceptor from './axiosInterceptor';
import {environment} from './environment';

// API_URL já inclui /api/ no final
const wampServer = environment.API_URL;
const axiosApi = axios.create({
    baseURL: wampServer,
    withCredentials: true, // Importante para CSRF token e cookies
});

axiosInterceptor.setupInterceptors(axiosApi, true, false);
export default axiosApi;
