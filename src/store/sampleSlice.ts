import { createSlice } from '@reduxjs/toolkit';

interface SampleState {
  value: number;
}

const initialState: SampleState = {
  value: 0,
};

export const sampleSlice = createSlice({
  name: 'sample',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
  },
});

export const { increment, decrement } = sampleSlice.actions;
export default sampleSlice.reducer;
