import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = createServer(app);

// ✅ Allow frontend origins (add your deployed frontend URL here)
const allowedOrigins = [
  "http://localhost:5173", // For local development
  "https://intervue-assignment-frontend.vercel.app", // Example frontend on Vercel
  "https://your-frontend.onrender.com" // Optional: if frontend is on Render
];

// ✅ Apply CORS to Express
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// In-memory storage
let currentPoll = null;
let students = new Map();
let pollHistory = [];
let pollResponses = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register_student', (data) => {
    const { name } = data;

    const existingStudent = Array.from(students.values()).find(
      student => student.name === name && student.connected
    );

    if (existingStudent) {
      socket.emit('registration_error', { message: 'Name already taken' });
      return;
    }

    const newStudent = {
      id: socket.id,
      name,
      connected: true,
      joinedAt: new Date()
    };

    students.set(socket.id, newStudent);
    socket.emit('registration_success', { name });

    io.emit('students_update', {
      count: students.size,
      students: Array.from(students.values())
    });

    if (currentPoll && currentPoll.status === 'active') {
      socket.emit('new_poll', currentPoll);
    }
  });

  socket.on('get_students_list', () => {
    socket.emit('students_list', {
      students: Array.from(students.values())
    });
  });

  socket.on('kick_student', ({ studentId }) => {
    const student = students.get(studentId);
    if (student) {
      io.to(studentId).emit('kicked');
      students.delete(studentId);

      io.emit('students_update', {
        count: students.size,
        students: Array.from(students.values())
      });

      console.log(`Student kicked: ${student.name}`);
    }
  });

  socket.on('create_poll', (pollData) => {
    if (currentPoll && currentPoll.status === 'active') {
      socket.emit('poll_error', { message: 'A poll is already active' });
      return;
    }

    currentPoll = {
      id: Date.now().toString(),
      question: pollData.question,
      options: pollData.options,
      status: 'active',
      createdAt: new Date(),
      timeLimit: pollData.timeLimit || 60,
      responses: {},
      results: pollData.options.reduce((acc, option, index) => {
        acc[String.fromCharCode(65 + index)] = 0;
        return acc;
      }, {})
    };

    pollResponses.clear();
    io.emit('new_poll', currentPoll);

    setTimeout(() => {
      if (currentPoll && currentPoll.status === 'active') {
        closePoll();
      }
    }, currentPoll.timeLimit * 1000);

    console.log('Poll created:', currentPoll.question);
  });

  socket.on('submit_answer', (data) => {
    if (!currentPoll || currentPoll.status !== 'active') {
      socket.emit('answer_error', { message: 'No active poll' });
      return;
    }

    const student = students.get(socket.id);
    if (!student) {
      socket.emit('answer_error', { message: 'Student not registered' });
      return;
    }

    if (pollResponses.has(socket.id)) {
      socket.emit('answer_error', { message: 'Already submitted answer' });
      return;
    }

    const { answer } = data;
    pollResponses.set(socket.id, {
      studentId: socket.id,
      studentName: student.name,
      answer,
      timestamp: new Date()
    });

    currentPoll.results[answer]++;
    currentPoll.responses[socket.id] = answer;

    io.emit('poll_results_update', {
      results: currentPoll.results,
      totalResponses: pollResponses.size,
      totalStudents: students.size
    });

    if (pollResponses.size >= students.size) {
      setTimeout(() => closePoll(), 1000);
    }

    console.log(`Answer submitted: ${student.name} - ${answer}`);
  });

  socket.on('close_poll', () => {
    closePoll();
  });

  socket.on('get_poll_status', () => {
    socket.emit('poll_status', {
      currentPoll,
      studentCount: students.size,
      responseCount: pollResponses.size
    });
  });

  socket.on('disconnect', () => {
    const student = students.get(socket.id);
    if (student) {
      students.delete(socket.id);
      io.emit('students_update', {
        count: students.size,
        students: Array.from(students.values())
      });
      console.log(`Student disconnected: ${student.name}`);
    }
    console.log('User disconnected:', socket.id);
  });
});

function closePoll() {
  if (!currentPoll) return;

  currentPoll.status = 'closed';
  currentPoll.closedAt = new Date();

  pollHistory.push({
    ...currentPoll,
    responses: Array.from(pollResponses.values())
  });

  io.emit('poll_closed', {
    poll: currentPoll,
    finalResults: currentPoll.results,
    totalResponses: pollResponses.size,
    totalStudents: students.size
  });

  console.log('Poll closed:', currentPoll.question);
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
