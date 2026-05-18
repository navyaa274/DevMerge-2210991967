import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

function Collaboration() {
  const { roomId } = useParams();
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    socketRef.current = new WebSocket(
      `${protocol}//localhost:5000/collaboration?roomId=${roomId}&token=${localStorage.getItem('token')}`
    );

    socketRef.current.onopen = () => {
      setLoading(false);
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'code-update') {
        setCode(data.code);
      } else if (data.type === 'output') {
        setOutput(data.output);
      } else if (data.type === 'users-update') {
        setUsers(data.users);
      } else if (data.type === 'message') {
        setMessages(prev => [...prev, data.message]);
      }
    };

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [roomId]);

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'code-update',
        code: newCode
      }));
    }
  };

  const handleRunCode = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/code/execute', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, language: 'javascript' })
      });

      const data = await response.json();
      setOutput(data.output);

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'output',
          output: data.output
        }));
      }
    } catch (err) {
      setOutput(`Error: ${typeof err.message === 'string' ? err.message : err?.toString() || 'Unknown error occurred'}`);
    }
  };

  const handleSendMessage = () => {
    if (messageInput.trim() && socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'message',
        text: messageInput
      }));
      setMessageInput('');
    }
  };

  if (loading) return <div className="text-center py-12">Connecting to collaboration room...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Live Collaboration</h1>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="col-span-3 grid grid-cols-2 gap-4">
            {/* Code Editor */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Code Editor</h2>
              <textarea
                value={code}
                onChange={handleCodeChange}
                className="w-full h-96 p-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Write your code here..."
              />
              <button
                onClick={handleRunCode}
                className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Run Code
              </button>
            </div>

            {/* Output */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Output</h2>
              <pre className="w-full h-96 p-3 font-mono text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg overflow-auto">
                {output || 'Output will appear here...'}
              </pre>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Users */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Users</h3>
              <div className="space-y-2">
                {users.map(user => (
                  <div key={user.id} className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-900 dark:text-white">{user.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col h-96">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Chat</h3>
              <div className="flex-1 overflow-y-auto mb-4 space-y-2">
                {messages.map((msg, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{msg.user}:</span>
                    <span className="text-gray-700 dark:text-gray-300 ml-2">{msg.text}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                  placeholder="Message..."
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Collaboration;
