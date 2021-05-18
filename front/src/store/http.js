import axios from 'axios'

export default class Http {

  host = 'http://localhost:5201/api';

  get (uri, query, options) {
    return axios.get(`${this.host}/${uri}`, { params: query })
      .then(res => {
        return res.data;
      })
  }

  post (uri, query, options) {
    return axios.post(`${this.host}/${uri}`, query ,{headers:{'Content-Type': 'application/json'}})
      .then(res => {
        return res.data;
      })
  }
}