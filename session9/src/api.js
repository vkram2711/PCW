import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const getBoards = () => axios.get(`${API_URL}/boards`);
export const getColumns = (boardId) => axios.get(`${API_URL}/columns/${boardId}`);
export const getTasks = (columnId) => axios.get(`${API_URL}/tasks/${columnId}`);
export const createTask = (columnId, task) => axios.post(`${API_URL}/columns/${columnId}/tasks`, task);
export const updateTaskColumn = (taskId, columnId) => axios.put(`${API_URL}/tasks/${taskId}`, { column_id: columnId });