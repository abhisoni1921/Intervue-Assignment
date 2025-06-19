import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
}

interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
}

const initialState: ChatState = {
  messages: [],
  isOpen: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { addMessage, toggleChat, clearMessages } = chatSlice.actions;

export default chatSlice.reducer;
