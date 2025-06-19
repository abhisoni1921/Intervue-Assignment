import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { Users, Clock, BarChart3, Plus, X, CheckCircle, UserX } from 'lucide-react';
import { Poll } from '../types';
import PollResults from './PollResults';
import ChatPopup from './ChatPopup';

interface TeacherDashboardProps {
  socket: Socket;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ socket }) => {
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [studentCount, setStudentCount] = useState(0);
  const [responseCount, setResponseCount] = useState(0);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [timeLimit, setTimeLimit] = useState(60);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [error, setError] = useState('');
  const [students, setStudents] = useState<Array<{id: string; name: string}>>([]);
  const [polls, setPolls] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showStudentList, setShowStudentList] = useState(false);

  useEffect(() => {
    socket.on('poll_status', (data) => {
      setCurrentPoll(data.currentPoll);
      setStudentCount(data.studentCount);
      setResponseCount(data.responseCount);
    });

    socket.on('students_update', (data) => {
      setStudentCount(data.count);
    });

    socket.on('poll_results_update', (data) => {
      setResponseCount(data.totalResponses);
      if (currentPoll) {
        setCurrentPoll(prev => prev ? { ...prev, results: data.results } : null);
      }
    });

    socket.on('poll_closed', (data) => {
      setCurrentPoll(data.poll);
      setTimeRemaining(0);
    });

    socket.on('poll_error', (data) => {
      setError(data.message);
      setTimeout(() => setError(''), 3000);
    });

    socket.on('students_list', (data) => {
      setStudents(data.students);
    });

    // Request initial student list
    socket.emit('get_students_list');

    return () => {
      socket.off('poll_status');
      socket.off('students_update');
      socket.off('poll_results_update');
      socket.off('poll_closed');
      socket.off('poll_error');
      socket.off('students_list');
    };
  }, [socket, currentPoll]);

  useEffect(() => {
    if (currentPoll && currentPoll.status === 'active') {
      const startTime = new Date(currentPoll.createdAt).getTime();
      const endTime = startTime + (currentPoll.timeLimit * 1000);
      
      const timer = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentPoll]);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const response = await fetch('/api/polls');
        const data = await response.json();
        setPolls(data);
      } catch (error) {
        console.error('Error fetching polls:', error);
      }
    };

    fetchPolls();
    
    // Set up polling interval
    const pollInterval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(pollInterval);
  }, [refreshKey]);

  useEffect(() => {
    const handlePollCreated = (poll: Poll) => {
      setCurrentPoll(poll);
      // Add to polls array immediately
      setPolls(prevPolls => [poll, ...prevPolls]);
    };

    socket.on('new_poll', handlePollCreated);

    return () => {
      socket.off('new_poll', handlePollCreated);
    };
  }, [socket]);

  const handleCreatePoll = () => {
    if (!question.trim()) {
      setError('Question is required');
      return;
    }

    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      setError('At least 2 options are required');
      return;
    }

    socket.emit('create_poll', {
      question: question.trim(),
      options: validOptions,
      timeLimit
    });

    // Clear form and close modal
    setShowCreatePoll(false);
    setQuestion('');
    setOptions(['', '', '', '']);
    setError('');
  };

  const handleClosePoll = () => {
    socket.emit('close_poll');
  };

  const handleKickStudent = (studentId: string) => {
    socket.emit('kick_student', { studentId });
    setStudents(prev => prev.filter(student => student.id !== studentId));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Teacher Dashboard</h1>
              <p className="text-gray-600">Manage your live polling sessions</p>
            </div>
            
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setShowStudentList(true)}
                className="flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-800">{studentCount} Students</span>
              </button>
              
              {!currentPoll || currentPoll.status === 'closed' ? (
                <button
                  onClick={() => setShowCreatePoll(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Poll</span>
                </button>
              ) : (
                <button
                  onClick={handleClosePoll}
                  className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <X className="w-5 h-5" />
                  <span>Close Poll</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Active Poll Status */}
        {currentPoll && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-3 h-3 rounded-full ${currentPoll.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className={`font-semibold ${currentPoll.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                    {currentPoll.status === 'active' ? 'LIVE POLL' : 'POLL CLOSED'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">{currentPoll.question}</h2>
              </div>
              
              {currentPoll.status === 'active' && (
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="flex items-center space-x-2 text-orange-600">
                      <Clock className="w-5 h-5" />
                      <span className="font-bold text-lg">{timeRemaining}s</span>
                    </div>
                    <div className="text-sm text-gray-500">remaining</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center space-x-2 text-blue-600">
                      <BarChart3 className="w-5 h-5" />
                      <span className="font-bold text-lg">{responseCount}/{studentCount}</span>
                    </div>
                    <div className="text-sm text-gray-500">responses</div>
                  </div>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {studentCount > 0 && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Response Progress</span>
                  <span>{Math.round((responseCount / studentCount) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(responseCount / studentCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Poll Results */}
            <PollResults poll={currentPoll} />
          </div>
        )}

        {/* Create Poll Modal */}
        {showCreatePoll && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Create New Poll</h3>
                <button
                  onClick={() => setShowCreatePoll(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Enter your poll question..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3 mb-2">
                      <span className="font-bold text-gray-600 min-w-[20px]">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (seconds)</label>
                  <input
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    min="10"
                    max="300"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreatePoll(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePoll}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold"
                >
                  Create Poll
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Student List Modal */}
        {showStudentList && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Connected Students</h3>
                  <p className="text-sm text-gray-600">{students.length} students online</p>
                </div>
                <button
                  onClick={() => setShowStudentList(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-4">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between bg-gray-50 p-4 rounded-lg group hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium">{student.name}</span>
                    </div>
                    <button
                      onClick={() => handleKickStudent(student.id)}
                      className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-700 p-2"
                    >
                     Kick Out
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat Popup */}
        <ChatPopup socket={socket} isTeacher={true} />
      </div>
    </div>
  );
};

export default TeacherDashboard;