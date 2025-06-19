import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Student } from '../types';

interface UserState {
  role: 'teacher' | 'student' | null;
  students: Student[];
  currentStudent: Student | null;
}

const initialState: UserState = {
  role: null,
  students: [],
  currentStudent: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setRole: (state, action: PayloadAction<'teacher' | 'student' | null>) => {
      state.role = action.payload;
    },
    setStudents: (state, action: PayloadAction<Student[]>) => {
      state.students = action.payload;
    },
    setCurrentStudent: (state, action: PayloadAction<Student | null>) => {
      state.currentStudent = action.payload;
    },
    removeStudent: (state, action: PayloadAction<string>) => {
      state.students = state.students.filter(student => student.id !== action.payload);
    },
  },
});

export const { setRole, setStudents, setCurrentStudent, removeStudent } = userSlice.actions;

export default userSlice.reducer;
