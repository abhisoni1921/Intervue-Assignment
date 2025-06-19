import React, { useState } from 'react';
import { Users, GraduationCap, ArrowRight, Zap } from 'lucide-react';
import { useSocket } from './hooks/useSocket';
import TeacherDashboard from './components/TeacherDashboard';
import StudentInterface from './components/StudentInterface';

type UserRole = 'teacher' | 'student' | null;

function App() {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const { socket, connected } = useSocket();

  // Connection status indicator
  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-white/20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Connecting to server...</p>
        </div>
      </div>
    );
  }

  // Role selection screen
  if (!userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Live Polling System
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Create engaging polls and get real-time responses from your audience. 
              Choose your role to get started.
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Teacher Card */}
            <div 
              onClick={() => setUserRole('teacher')}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Teacher</h3>
                <p className="text-gray-600 mb-6">
                  Create and manage live polls, view real-time results, and engage with your students.
                </p>
                <div className="flex items-center justify-center text-blue-600 font-semibold group-hover:text-blue-700">
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
              
              {/* Feature highlights */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Create interactive polls</li>
                  <li>• Real-time response tracking</li>
                  <li>• Visual result analytics</li>
                </ul>
              </div>
            </div>

            {/* Student Card */}
            <div 
              onClick={() => setUserRole('student')}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Student</h3>
                <p className="text-gray-600 mb-6">
                  Join live polling sessions, submit your responses, and see results in real-time.
                </p>
                <div className="flex items-center justify-center text-purple-600 font-semibold group-hover:text-purple-700">
                  <span>Join Session</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
              
              {/* Feature highlights */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Participate in live polls</li>
                  <li>• Instant result viewing</li>
                  <li>• Easy name registration</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12">
            <p className="text-gray-500">
              Powered by React, Socket.io, and modern web technologies
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render appropriate interface based on role
  if (userRole === 'teacher' && socket) {
    return <TeacherDashboard socket={socket} />;
  }

  if (userRole === 'student' && socket) {
    return <StudentInterface socket={socket} />;
  }

  return null;
}

export default App;