import axios from 'axios'
import {
  TEACHER_LIST_REQUEST, TEACHER_LIST_SUCCESS, TEACHER_LIST_FAIL,
  TEACHER_REGISTER_REQUEST, TEACHER_REGISTER_SUCCESS, TEACHER_REGISTER_FAIL,
  TEACHER_DELETE_REQUEST, TEACHER_DELETE_SUCCESS, TEACHER_DELETE_FAIL,
  TEACHER_SALARY_REQUEST, TEACHER_SALARY_SUCCESS, TEACHER_SALARY_FAIL,
} from '../constants/teacherConstants'

const authHeader = () => {
  const token = localStorage.getItem('jwtToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// GET /api/get-teachers/:sessionId
export const listTeachers = (sessionId) => async (dispatch) => {
  try {
    dispatch({ type: TEACHER_LIST_REQUEST })
    const { data } = await axios.get(`/api/get-teachers/${sessionId}`, { headers: authHeader() })
    dispatch({ type: TEACHER_LIST_SUCCESS, payload: Array.isArray(data) ? data : data?.data || [] })
  } catch (error) {
    dispatch({ type: TEACHER_LIST_FAIL, payload: error.response?.data?.message || error.message })
  }
}

// POST /api/create-teachers
export const teacherregister = (teacherData) => async (dispatch) => {
  try {
    dispatch({ type: TEACHER_REGISTER_REQUEST })
    const { data } = await axios.post('/api/create-teachers', teacherData, {
      headers: { 'Content-Type': 'application/json', ...authHeader() },
    })
    dispatch({ type: TEACHER_REGISTER_SUCCESS, payload: data })
  } catch (error) {
    dispatch({ type: TEACHER_REGISTER_FAIL, payload: error.response?.data?.message || error.message })
  }
}

// DELETE /api/users/:userId
export const deleteTeacher = (id) => async (dispatch) => {
  try {
    dispatch({ type: TEACHER_DELETE_REQUEST })
    const { data } = await axios.delete(`/api/users/${id}`, { headers: authHeader() })
    dispatch({ type: TEACHER_DELETE_SUCCESS, payload: data })
  } catch (error) {
    dispatch({ type: TEACHER_DELETE_FAIL, payload: error.response?.data?.message || error.message })
  }
}

// Teacher salary is managed via receipts in this backend — stub kept for compatibility
export const PaySalary = (teachername, teacherid, salaryForTheYear, salaryForTheMonth, salaryAmount) => async (dispatch) => {
  try {
    dispatch({ type: TEACHER_SALARY_REQUEST })
    const { data } = await axios.post('/api/receipt', {
      teachername, teacherid, salaryForTheYear, salaryForTheMonth, salaryAmount, type: 'salary',
    }, { headers: { 'Content-Type': 'application/json', ...authHeader() } })
    dispatch({ type: TEACHER_SALARY_SUCCESS, payload: data })
  } catch (error) {
    dispatch({ type: TEACHER_SALARY_FAIL, payload: error.response?.data?.message || error.message })
  }
}
