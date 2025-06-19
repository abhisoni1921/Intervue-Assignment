import { configureStore } from '@reduxjs/toolkit';
import sampleReducer from './sampleSlice';
import pollReducer from './pollSlice';
import chatReducer from './chatSlice';
import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
    sample: sampleReducer,
    poll: pollReducer,
    chat: chatReducer,
    user: userReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;



