import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Poll } from '../types';
import { BarChart3, PieChart as PieChartIcon, Trophy } from 'lucide-react';

interface PollResultsProps {
  poll: Poll;
}

const COLORS = ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

const PollResults: React.FC<PollResultsProps> = ({ poll }) => {
  const [viewType, setViewType] = React.useState<'bar' | 'pie'>('bar');

  const chartData = poll.options.map((option, index) => {
    const optionKey = String.fromCharCode(65 + index);
    return {
      option: `${optionKey}. ${option}`,
      optionShort: optionKey,
      votes: poll.results[optionKey] || 0,
      percentage: poll.results[optionKey] ? 
        Math.round((poll.results[optionKey] / Object.values(poll.results).reduce((a, b) => a + b, 0)) * 100) : 0
    };
  });

  const totalVotes = Object.values(poll.results).reduce((a, b) => a + b, 0);
  const maxVotes = Math.max(...Object.values(poll.results));
  const winningOptions = poll.options.filter((_, index) => {
    const optionKey = String.fromCharCode(65 + index);
    return poll.results[optionKey] === maxVotes && maxVotes > 0;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-white/20">
          <p className="font-semibold text-gray-800">{`${label}`}</p>
          <p className="text-blue-600">
            {`Votes: ${payload[0].value} (${payload[0].payload.percentage}%)`}
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-white/20">
          <p className="font-semibold text-gray-800">{`${payload[0].payload.option}`}</p>
          <p className="text-blue-600">
            {`Votes: ${payload[0].value} (${payload[0].payload.percentage}%)`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Poll Results</h3>
          <p className="text-sm text-gray-600">{totalVotes} total responses</p>
        </div>
        
        {/* Chart Type Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewType('bar')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
              viewType === 'bar' 
                ? 'bg-white shadow-sm text-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm font-medium">Bar</span>
          </button>
          <button
            onClick={() => setViewType('pie')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
              viewType === 'pie' 
                ? 'bg-white shadow-sm text-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <PieChartIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Pie</span>
          </button>
        </div>
      </div>

      {/* Winner Announcement */}
      {totalVotes > 0 && winningOptions.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Trophy className="w-6 h-6 text-yellow-600" />
            <div>
              <h4 className="font-semibold text-yellow-800">
                {winningOptions.length === 1 ? 'Winner!' : 'Tie!'}
              </h4>
              <p className="text-yellow-700">
                {winningOptions.length === 1 
                  ? `"${winningOptions[0]}" leads with ${maxVotes} votes` 
                  : `Multiple options tied with ${maxVotes} votes each`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      {totalVotes > 0 ? (
        <div className="bg-white/50 rounded-xl p-6">
          {viewType === 'bar' ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="optionShort" 
                  stroke="#6B7280"
                  fontSize={12}
                  fontWeight="500"
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={12}
                  fontWeight="500"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="votes" 
                  fill="url(#gradient)"
                  radius={[4, 4, 0, 0]}
                >
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="votes"
                  label={({ optionShort, percentage }) => `${optionShort}: ${percentage}%`}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No responses yet</p>
        </div>
      )}

      {/* Detailed Results Table */}
      <div className="bg-white/50 rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-white/80 border-b border-gray-200">
          <h4 className="font-semibold text-gray-800">Detailed Results</h4>
        </div>
        <div className="divide-y divide-gray-200">
          {chartData.map((item, index) => (
            <div key={index} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="font-medium text-gray-800">{item.option}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="font-semibold text-gray-800">{item.votes} votes</div>
                  <div className="text-sm text-gray-600">{item.percentage}%</div>
                </div>
                <div className="w-24">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PollResults;