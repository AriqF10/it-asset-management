import client from './client';

export const listMaintenanceRecords = (params) => client.get('/maintenance-records/', { params });
export const createMaintenanceRecord = (payload) => client.post('/maintenance-records/', payload);
export const updateMaintenanceRecord = (id, payload) => client.patch(`/maintenance-records/${id}/`, payload);
