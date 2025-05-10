import { useEffect, useRef, useState } from "react";
import type { Chat } from '../types/Chat';
interface Props {
  token: string;
  username: string;
  onLogout: () => void;
}

export default function ChatPage({ token, username, onLogout }: Props){
  const [connected, setConnected] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [messages, setMessages] = useState<Chat[]>([]);
  const [input, setInput] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8000');
    wsRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
      setConnected(true);
      // Send token for authentication
      socket.send(JSON.stringify({ type: "auth", token }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'auth_success') {
        setAuthenticated(true);
      } else if (data.type === 'history') {
        setMessages(data.payload);
      } else if (data.type === 'message') {
        setMessages((prev) => [...prev, data.payload]);
      } else if (data.type === 'user_joined') {
        setMessages((prev) => [
          ...prev,
          {
            username: 'System',
            text: `${data.payload.username} joined the chat.`,
            createdAt: new Date().toISOString(),
          },
        ]);
      } else if (data.type === 'user_left') {
        setMessages((prev) => [
          ...prev,
          {
            username: 'System',
            text: `${data.payload.username} left the chat.`,
            createdAt: new Date().toISOString(),
          },
        ]);
      } else if (data.type === 'error') {
        console.error(data.message);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setConnected(false);
      setAuthenticated(false);
    };

    return () => {
      socket.close();
    };
  }, [token]);

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const sendMessage = () => {
    if (input.trim() && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'message', text: input }));
      setInput('');
    }
  };

  const handleEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 bg-blue-400 text-white text-xl flex justify-between items-center">
        <h2>Live Chat</h2>
       <div className="flex justify-end items-center gap-2.5">
          <h2>Welcome {username}</h2>
          <button onClick={onLogout} className="px-4 py-2 bg-white text-blue-500 rounded hover:bg-gray-100">
            Logout
          </button>
       </div>
      </div>

      <div className="flex-grow p-4 overflow-y-auto bg-[#e9ecef]">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-3 p-2 rounded-md bg-white ${
              msg.username === username ? 'bg-[#d1ffd6] text-right' : ''
            }`}
          >
            <strong>{msg.username}:</strong> {msg.text}
            <div className="text-[10px] text-gray-500">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="flex p-2.5 bg-white gap-2.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleEnterKey}
          placeholder="Type a message"
          className="flex-1 p-2.5 text-base border border-solid border-blue-400 rounded-sm"
        />
        <button
          onClick={sendMessage}
          className="px-5 py-2.5 text-base border border-solid border-blue-400 rounded-sm cursor-pointer"
        >
          Send
        </button>
      </div>
    </div>
  );
}