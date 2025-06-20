// import express from 'express';
// import { createServer } from 'http';
// import { Server } from 'socket.io';
// import cors from 'cors';
// import { Poll, Student, PollResponse } from '../src/types';

// const app = express();
// const httpServer = createServer(app);
// const io = new Server(httpServer, {
//   cors: {
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST"]
//   }
// });

// app.use(cors());
// app.use(express.json());

// // In-memory storage
// let students: Student[] = [];
// let currentPoll: Poll | null = null;
// let pastPolls: Poll[] = [];

// io.on('connection', (socket) => {
//   console.log('Client connected:', socket.id);

//   // Student registration
//   socket.on('register_student', ({ name }) => {
//     if (students.find(s => s.name === name)) {
//       socket.emit('registration_error', { message: 'Name already taken' });
//       return;
//     }

//     const student: Student = {
//       id: socket.id,
//       name,
//       connected: true,
//       joinedAt: new Date()
//     };

//     students.push(student);
//     socket.emit('registration_success', { name });
//     io.emit('students_update', { count: students.length });
//   });

//   // Teacher creating a poll
//   socket.on('create_poll', ({ question, options, timeLimit }) => {
//     if (currentPoll && currentPoll.status === 'active') {
//       socket.emit('poll_error', { message: 'A poll is already active' });
//       return;
//     }

//     currentPoll = {
//       id: Date.now().toString(),
//       question,
//       options,
//       status: 'active',
//       createdAt: new Date(),
//       timeLimit,
//       responses: {},
//       results: {}
//     };

//     io.emit('new_poll', currentPoll);

//     // Auto-close poll after timeLimit
//     setTimeout(() => {
//       if (currentPoll && currentPoll.status === 'active') {
//         currentPoll.status = 'closed';
//         currentPoll.closedAt = new Date();
//         pastPolls.push({ ...currentPoll });
//         io.emit('poll_closed', { poll: currentPoll });
//       }
//     }, timeLimit * 1000);
//   });

//   // Student submitting answer
//   socket.on('submit_answer', ({ answer }) => {
//     if (!currentPoll || currentPoll.status !== 'active') {
//       socket.emit('answer_error', { message: 'No active poll' });
//       return;
//     }

//     const student = students.find(s => s.id === socket.id);
//     if (!student) {
//       socket.emit('answer_error', { message: 'Student not found' });
//       return;
//     }

//     currentPoll.responses[socket.id] = answer;
//     currentPoll.results[answer] = (currentPoll.results[answer] || 0) + 1;

//     io.emit('poll_results_update', {
//       results: currentPoll.results,
//       totalResponses: Object.keys(currentPoll.responses).length
//     });
//   });

//   // Chat messages
//   socket.on('send_message', ({ text }) => {
//     const student = students.find(s => s.id === socket.id);
//     const senderName = student ? student.name : 'Teacher';
//     io.emit('chat_message', {
//       sender: senderName,
//       text,
//       senderId: socket.id
//     });
//   });

//   // Teacher kicking student
//   socket.on('kick_student', ({ studentId }) => {
//     const student = students.find(s => s.id === studentId);
//     if (student) {
//       io.to(studentId).emit('user_kicked');
//       students = students.filter(s => s.id !== studentId);
//       io.emit('students_update', { count: students.length });
//     }
//   });

//   // Disconnect handling
//   socket.on('disconnect', () => {
//     students = students.filter(s => s.id !== socket.id);
//     io.emit('students_update', { count: students.length });
//   });
// });

// const PORT = process.env.PORT || 3001;
// httpServer.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
