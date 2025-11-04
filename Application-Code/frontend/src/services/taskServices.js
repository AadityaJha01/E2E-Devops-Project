import axios from "axios";
const apiUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3500/api/tasks";
console.log(apiUrl);

export function getTasks(filters = {}) {
    const params = new URLSearchParams();
    if (filters.completed !== undefined) params.append("completed", filters.completed);
    if (filters.priority) params.append("priority", filters.priority);
    if (filters.category) params.append("category", filters.category);
    if (filters.search) params.append("search", filters.search);
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
    
    const queryString = params.toString();
    return axios.get(apiUrl + (queryString ? `?${queryString}` : ""));
}

export function getStats() {
    return axios.get(apiUrl + "/stats");
}

export function addTask(task) {
    return axios.post(apiUrl, task);
}

export function updateTask(id, task) {
    return axios.put(apiUrl + "/" + id, task);
}

export function deleteTask(id) {
    return axios.delete(apiUrl + "/" + id);
}
