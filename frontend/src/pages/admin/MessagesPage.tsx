// frontend/src/pages/admin/MessagesPage.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiX, FiEye, FiMail, FiCalendar, FiUser, FiMessageSquare } from 'react-icons/fi';
import { API_BASE_URL } from '../../utils/apiConfig';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Message {
  _id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  replied: boolean;
  replyMessage?: string;
  repliedAt?: string;
  createdAt: string;
}

const MessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    replied: 0,
    today: 0
  });
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const itemsPerPage = 8;

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/admin/messages`, { withCredentials: true });
      setMessages(data.messages);
      setFilteredMessages(data.messages);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  // Fetch message statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/messages/stats`, {
        withCredentials: true
      });
      setStats(response.data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, []);

  const handleSelectMessage = async (message: Message) => {
    setSelectedMessage(message);
    setReplyText(message.replyMessage || '');
    
    // Mark as read if not already read
    if (!message.read) {
      try {
        await axios.put(`${API_BASE_URL}/admin/messages/${message._id}/read`, {}, {
          withCredentials: true
        });
        setMessages(prev => prev.map(msg => 
          msg._id === message._id ? { ...msg, read: true } : msg
        ));
        fetchStats(); // Refresh stats
      } catch (err) {
        console.error('Failed to mark message as read:', err);
      }
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/admin/messages/${id}`, {
        withCredentials: true
      });
      setMessages(prev => prev.filter(msg => msg._id !== id));
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage(null);
      }
      fetchStats(); // Refresh stats
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete message');
    }
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    try {
      setIsReplying(true);
      const response = await axios.put(
        `${API_BASE_URL}/admin/messages/${selectedMessage._id}/reply`,
        { replyMessage: replyText },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Update the message in the list
        setMessages(prev => prev.map(msg => 
          msg._id === selectedMessage._id 
            ? { 
                ...msg, 
                replied: true, 
                replyMessage: replyText,
                repliedAt: new Date().toISOString()
              } 
            : msg
        ));
        
        // Update selected message
        setSelectedMessage(prev => prev ? {
          ...prev,
          replied: true,
          replyMessage: replyText,
          repliedAt: new Date().toISOString()
        } : null);

        setReplyText('');
        fetchStats(); // Refresh stats
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reply');
    } finally {
      setIsReplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiMessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <FiMail className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-gray-900">{stats.unread}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiMail className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Replied</p>
              <p className="text-2xl font-bold text-gray-900">{stats.replied}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FiCalendar className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 h-full">
        {/* Message List Panel */}
        <div className={`bg-white rounded-lg shadow-md ${selectedMessage ? 'md:w-1/3' : 'w-full'}`}>
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Customer Messages</h2>
            <div className="mt-3 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filteredMessages.length > 0 ? filteredMessages[0].name : ''}
                onChange={(e) => {
                  const searchTerm = e.target.value;
                  setFilteredMessages(messages.filter(message => 
                    message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    message.message.toLowerCase().includes(searchTerm.toLowerCase())
                  ));
                }}
              />
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
            {filteredMessages.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No messages found
              </div>
            ) : (
              filteredMessages.map(message => (
                <div 
                  key={message._id}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedMessage?._id === message._id ? 'bg-blue-50' : ''
                  } ${!message.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                  onClick={() => handleSelectMessage(message)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800 truncate">{message.name}</h3>
                        {!message.read && (
                          <span className="px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                            New
                          </span>
                        )}
                        {message.replied && (
                          <span className="px-1.5 py-0.5 bg-green-500 text-white text-xs rounded-full">
                            Replied
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">{message.message}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(message.createdAt)}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMessage(message._id);
                        }}
                        className="mt-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <FiMail className="mr-1" size={12} />
                    <span className="truncate">{message.email}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Message Detail Panel */}
        {selectedMessage && (
          <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Message Details</h2>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <FiCalendar className="mr-1" />
                  <span>
                    {formatDate(selectedMessage.createdAt)}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => handleDeleteMessage(selectedMessage._id)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <FiX size={18} />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <FiUser className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{selectedMessage.name}</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <FiMail className="mr-1" size={14} />
                      <a 
                        href={`mailto:${selectedMessage.email}`} 
                        className="hover:text-blue-600 hover:underline"
                      >
                        {selectedMessage.email}
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-line">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>
              
              {selectedMessage.replied && selectedMessage.replyMessage && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-800 mb-3">Your Reply</h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-line">
                      {selectedMessage.replyMessage}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Replied on: {selectedMessage.repliedAt ? formatDate(selectedMessage.repliedAt) : 'Unknown'}
                    </p>
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="font-bold text-gray-800 mb-3">
                  {selectedMessage.replied ? 'Update Reply' : 'Reply to Message'}
                </h3>
                <textarea
                  className="w-full h-32 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type your response here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                ></textarea>
                <div className="mt-3 flex justify-end">
                  <button 
                    onClick={handleSendReply}
                    disabled={isReplying || !replyText.trim()}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${
                      isReplying || !replyText.trim() ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isReplying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FiMail size={16} />
                        {selectedMessage.replied ? 'Update Reply' : 'Send Reply'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;