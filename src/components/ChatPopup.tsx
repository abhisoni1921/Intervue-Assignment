import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { MessageCircle, X, Send, UserX } from 'lucide-react';

interface ChatPopupProps {
  socket: Socket;
  isTeacher?: boolean;
}

interface ChatMessage {
  sender: string;
  text: string;
  senderId: string;
}

const ChatPopup: React.FC<ChatPopupProps> = ({ socket, isTeacher = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    socket.on('chat_message', (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('user_kicked', () => {
      window.location.reload(); // Reload page when kicked
    });

    return () => {
      socket.off('chat_message');
      socket.off('user_kicked');
    };
  }, [socket]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('send_message', { text: message });
      setMessage('');
    }
  };

  const handleKickStudent = (studentId: string) => {
    if (isTeacher) {
      socket.emit('kick_student', { studentId });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700"
        >
          <MessageCircle />
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl w-80">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-semibold">Class Chat</h3>
            <button onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="h-96 overflow-y-auto p-4">
            {messages.map((msg, idx) => (
              <div key={idx} className="mb-2 flex items-center justify-between group">
                <div>
                  <span className="font-bold">{msg.sender}: </span>
                  <span>{msg.text}</span>
                </div>
                {isTeacher && msg.senderId !== socket.id && (
                  <button
                    onClick={() => handleKickStudent(msg.senderId)}
                    className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg"
                placeholder="Type a message..."
              />
              <button
                type="submit"
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatPopup;
