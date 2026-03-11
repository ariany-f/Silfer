import axios from 'axios';
import axiosInterceptor from './axiosInterceptor';
import {environment} from './environment';

// API_URL já inclui /api/ no final (usa MIX_API_URL quando definido)
const wampServer = environment.API_URL;
const axiosApi = axios.create({
    baseURL: wampServer,
});
axiosInterceptor.setupInterceptors(axiosApi, false, true);
export default axiosApi;
