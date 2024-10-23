import axios from 'axios'

const api = axios.create({
    baseURL: 'http://internet-plan-service.local',
    timeout: 10000
})

export default api