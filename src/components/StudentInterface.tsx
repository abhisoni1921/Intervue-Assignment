import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { User, Clock, CheckCircle, AlertCircle, BarChart3, Users } from 'lucide-react';
import { Poll } from '../types';
import PollResults from './PollResults';
import ChatPopup from './ChatPopup';

interface StudentInterfaceProps {
  socket: Socket;
}

const StudentInterface: React.FC<StudentInterfaceProps> = ({ socket }) => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [error, setError] = useState('');
  const [studentCount, setStudentCount] = useState(0);
  const [responseCount, setResponseCount] = useState(0);

  useEffect(() => {
    // Check if student name is stored in sessionStorage for this tab
    const savedName = sessionStorage.getItem('studentName');
    if (savedName) {
      setStudentName(savedName);
      setNameInput(savedName);
      socket.emit('register_student', { name: savedName });
    }

    // Socket event listeners
    socket.on('registration_success', (data) => {
      setIsRegistered(true);
      setStudentName(data.name);
      setError('');
      // Store in sessionStorage to persist across refreshes in this tab
      sessionStorage.setItem('studentName', data.name);
    });

    socket.on('registration_error', (data) => {
      setError(data.message);
      setIsRegistered(false);
      // Clear sessionStorage if registration fails
      sessionStorage.removeItem('studentName');
    });

    socket.on('new_poll', (poll) => {
      setCurrentPoll(poll);
      setHasAnswered(false);
      setSelectedAnswer('');
      setError('');
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

    socket.on('students_update', (data) => {
      setStudentCount(data.count);
    });

    socket.on('answer_error', (data) => {
      setError(data.message);
      setTimeout(() => setError(''), 3000);
    });

    socket.on('kicked', () => {
      sessionStorage.removeItem('studentName');
      setIsRegistered(false);
      setError('You have been removed from the session');
    });

    // Cleanup on unmount
    return () => {
      socket.off('registration_success');
      socket.off('registration_error');
      socket.off('kicked');
    };
  }, [socket]);

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

  const handleRegister = () => {
    if (!nameInput.trim()) {
      setError('Please enter your name');
      return;
    }

    socket.emit('register_student', { name: nameInput.trim() });
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) {
      setError('Please select an answer');
      return;
    }

    socket.emit('submit_answer', { answer: selectedAnswer });
    setHasAnswered(true);
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!isRegistered) {
        handleRegister();
      } else if (currentPoll && currentPoll.status === 'active' && !hasAnswered) {
        handleSubmitAnswer();
      }
    }
  };

  // Registration screen
  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-md border border-white/20">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-4 rounded-2xl inline-block mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Join Polling Session</h1>
            <p className="text-gray-600">Enter your name to participate in live polls</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your full name"
                maxLength={50}
              />
            </div>

            <button
              onClick={handleRegister}
              disabled={!nameInput.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Session
            </button>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Your name must be unique for this session
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Dashboard</h1>
              <p className="text-gray-600">Welcome, <span className="font-semibold text-purple-600">{studentName}</span></p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 bg-purple-100 px-4 py-2 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-purple-800">{studentCount} Students</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Active Poll */}
        {currentPoll ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-3 h-3 rounded-full ${currentPoll.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className={`font-semibold ${currentPoll.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                    {currentPoll.status === 'active' ? 'LIVE POLL' : 'POLL CLOSED'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">{currentPoll.question}</h2>
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

            {/* Answer Options */}
            {currentPoll.status === 'active' && !hasAnswered && timeRemaining > 0 && (
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-gray-700 mb-4">Choose your answer:</h3>
                {currentPoll.options.map((option, index) => {
                  const optionKey = String.fromCharCode(65 + index);
                  return (
                    <button
                      key={optionKey}
                      onClick={() => setSelectedAnswer(optionKey)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedAnswer === optionKey
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          selectedAnswer === optionKey
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {optionKey}
                        </div>
                        <span className="font-medium">{option}</span>
                      </div>
                    </button>
                  );
                })}
                
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                >
                  Submit Answer
                </button>
              </div>
            )}

            {/* Answer Submitted Message */}
            {hasAnswered && currentPoll.status === 'active' && (
              <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Your answer has been submitted! Waiting for other students...</span>
              </div>
            )}

            {/* Time's Up Message */}
            {currentPoll.status === 'active' && timeRemaining === 0 && !hasAnswered && (
              <div className="bg-orange-100 border border-orange-300 text-orange-700 px-4 py-3 rounded-xl mb-6 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5" />
                <span>Time's up! You can now view the results.</span>
              </div>
            )}

            {/* Progress Bar */}
            {studentCount > 0 && (hasAnswered || currentPoll.status === 'closed' || timeRemaining === 0) && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Response Progress</span>
                  <span>{Math.round((responseCount / studentCount) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(responseCount / studentCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Poll Results */}
            {(hasAnswered || currentPoll.status === 'closed' || timeRemaining === 0) && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-4">Live Results:</h3>
                <PollResults poll={currentPoll} />
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-white/20">
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-6 rounded-2xl inline-block mb-6">
              <Clock className="w-12 h-12 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Waiting for Poll</h2>
            <p className="text-gray-600 mb-6">
              Your teacher will start a poll soon. Stay tuned for questions!
            </p>
            <div className="flex justify-center">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add ChatPopup at the end of the return statement */}
      <ChatPopup socket={socket} isTeacher={false} />
    </div>
  );
};

export default StudentInterface;