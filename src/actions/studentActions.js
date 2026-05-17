import axios from 'axios'
import {
  STUDENT_LIST_REQUEST, STUDENT_LIST_SUCCESS, STUDENT_LIST_FAIL,
  STUDENT_CLASS_LIST_REQUEST, STUDENT_CLASS_LIST_SUCCESS, STUDENT_CLASS_LIST_FAIL,
  STUDENT_REGISTER_REQUEST, STUDENT_REGISTER_SUCCESS, STUDENT_REGISTER_FAIL,
  STUDENT_DELETE_REQUEST, STUDENT_DELETE_SUCCESS, STUDENT_DELETE_FAIL,
  STUDENT_ATTENDANCE_REQUEST, STUDENT_ATTENDANCE_SUCCESS, STUDENT_ATTENDANCE_FAIL,
  STUDENT_FEES_REQUEST, STUDENT_FEES_SUCCESS, STUDENT_FEES_FAIL,
} from '../constants/studentConstants'

const authHeader = () => {
  const token = localStorage.getItem('jwtToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// GET /api/users/student/:sessionId
export const listStudents = (sessionId) => async (dispatch) => {
  try {
    dispatch({ type: STUDENT_LIST_REQUEST })
    const { data } = await axios.get(`/api/users/student/${sessionId}`, { headers: authHeader() })
    dispatch({ type: STUDENT_LIST_SUCCESS, payload: Array.isArray(data) ? data : data?.data || [] })
  } catch (error) {
    dispatch({ type: STUDENT_LIST_FAIL, payload: error.response?.data?.message || error.message })
  }
}

// GET /api/students/:sessionId/:classname
export const classlistStudent = (sessionId, classname) => async (dispatch) => {
  try {
    dispatch({ type: STUDENT_CLASS_LIST_REQUEST })
    const { data } = await axios.get(`/api/students/${sessionId}/${classname}`, { headers: authHeader() })
    dispatch({ type: STUDENT_CLASS_LIST_SUCCESS, payload: Array.isArray(data) ? data : data?.data || [] })
  } catch (error) {
    dispatch({ type: STUDENT_CLASS_LIST_FAIL, payload: error.response?.data?.message || error.message })
  }
}

// POST /api/register  (role: 'student')
export const Register = (studentData) => async (dispatch) => {
  try {
    dispatch({ type: STUDENT_REGISTER_REQUEST })
    const { data } = await axios.post('/api/register', { ...studentData, role: 'student' }, {
      headers: { 'Content-Type': 'application/json', ...authHeader() },
    })
    dispatch({ type: STUDENT_REGISTER_SUCCESS, payload: data })
  } catch (error) {
    dispatch({ type: STUDENT_REGISTER_FAIL, payload: error.response?.data?.message || error.message })
  }
}

// DELETE /api/users/:userId
export const deleteStudent = (id) => async (dispatch) => {
  try {
    dispatch({ type: STUDENT_DELETE_REQUEST })
    const { data } = await axios.delete(`/api/users/${id}`, { headers: authHeader() })
    dispatch({ type: STUDENT_DELETE_SUCCESS, payload: data })
  } catch (error) {
    dispatch({ type: STUDENT_DELETE_FAIL, payload: error.response?.data?.message || error.message })
  }
}

// POST /api/receipt  (student fee payment)
export const PayFees = (receiptData) => async (dispatch) => {
  try {
    dispatch({ type: STUDENT_FEES_REQUEST })
    const { data } = await axios.post('/api/receipt', receiptData, {
      headers: { 'Content-Type': 'application/json', ...authHeader() },
    })
    dispatch({ type: STUDENT_FEES_SUCCESS, payload: data })
  } catch (error) {
    dispatch({ type: STUDENT_FEES_FAIL, payload: error.response?.data?.message || error.message })
  }
}
