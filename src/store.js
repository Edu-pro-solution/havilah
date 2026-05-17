import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { thunk } from "redux-thunk";
import { studentListReducer } from "./reducers/studentReducers";
import { userLoginReducer } from "./reducers/userReducers";
import {
  studentClassListReducer,
  studentSearchReducer,
  studentRegisterReducer,
  studentDeleteReducer,
  studentAttendanceReducer,
  studentFeesReducer,
} from "./reducers/studentReducers";
import { allIncomeReducer, allSalaryReducer } from "./reducers/miscellaneousReducers";
import {
  teacherSalaryReducer,
  teacherRegisterReducer,
  teacherDeleteReducer,
  teacherListReducer,
} from "./reducers/teacherReducers";
import {
  staffSalaryReducer,
  staffRegisterReducer,
  staffDeleteReducer,
  staffListReducer,
} from "./reducers/staffReducers";

const reducer = combineReducers({
  studentList: studentListReducer,
  studentClassList: studentClassListReducer,
  studentSearch: studentSearchReducer,
  userLogin: userLoginReducer,
  studentRegister: studentRegisterReducer,
  studentDelete: studentDeleteReducer,
  studentAttendance: studentAttendanceReducer,
  studentFees: studentFeesReducer,
  teacherSalary: teacherSalaryReducer,
  teacherRegister: teacherRegisterReducer,
  teacherDelete: teacherDeleteReducer,
  teacherList: teacherListReducer,
  staffSalary: staffSalaryReducer,
  staffRegister: staffRegisterReducer,
  staffDelete: staffDeleteReducer,
  staffList: staffListReducer,
  allIncome: allIncomeReducer,
  allSalary: allSalaryReducer,
});

const userInfoFromStorage = localStorage.getItem("userCred")
  ? JSON.parse(localStorage.getItem("userCred"))
  : null;

const initialState = {
  userLogin: { userCred: userInfoFromStorage },
};

const middleware = [thunk];

const composeEnhancers =
  typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : compose;

const store = createStore(reducer, initialState, composeEnhancers(applyMiddleware(...middleware)));

export default store;
