import client from './client';

export const listAssets = (params) => client.get('/assets/', { params });
export const getAsset = (id) => client.get(`/assets/${id}/`);
export const createAsset = (payload) => client.post('/assets/', payload);
export const updateAsset = (id, payload) => client.patch(`/assets/${id}/`, payload);
export const deleteAsset = (id) => client.delete(`/assets/${id}/`);
export const getDashboard = () => client.get('/assets/dashboard/');
export const assignAsset = (id, payload) => client.post(`/assets/${id}/assign/`, payload);
export const unassignAsset = (id) => client.post(`/assets/${id}/unassign/`);

export const listEmployees = (params) => client.get('/employees/', { params });
export const createEmployee = (payload) => client.post('/employees/', payload);
export const updateEmployee = (id, payload) => client.patch(`/employees/${id}/`, payload);
export const deleteEmployee = (id) => client.delete(`/employees/${id}/`);
