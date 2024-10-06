import axios from 'axios'

import { API_URL_BASE, API_URL_BASE_SANDBOX } from '@env'
// https://webapi.vivensisapi.com.br/pegasus_api/vivensis
const api = axios.create({
  baseURL: API_URL_BASE_SANDBOX,
})

export default api
