import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Poll } from '../types';

interface PollState {
  currentPoll: Poll | null;
  pastPolls: Poll[];
  studentCount: number;
  responseCount: number;
}

const initialState: PollState = {
  currentPoll: null,
  pastPolls: [],
  studentCount: 0,
  responseCount: 0,
};

const pollSlice = createSlice({
  name: 'poll',
  initialState,
  reducers: {
    setCurrentPoll: (state, action: PayloadAction<Poll | null>) => {
      state.currentPoll = action.payload;
    },
    addPastPoll: (state, action: PayloadAction<Poll>) => {
      state.pastPolls.push(action.payload);
    },
    setStudentCount: (state, action: PayloadAction<number>) => {
      state.studentCount = action.payload;
    },
    setResponseCount: (state, action: PayloadAction<number>) => {
      state.responseCount = action.payload;
    },
    updatePollResults: (state, action: PayloadAction<{ results: Record<string, number> }>) => {
      if (state.currentPoll) {
        state.currentPoll.results = action.payload.results;
      }
    },
  },
});

export const {
  setCurrentPoll,
  addPastPoll,
  setStudentCount,
  setResponseCount,
  updatePollResults,
} = pollSlice.actions;

export default pollSlice.reducer;
