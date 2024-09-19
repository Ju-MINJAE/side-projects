import { useEffect, useState } from 'react';
import './App.css';
import { io } from 'socket.io-client';

function App() {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);

  const connectToChatServer = () => {
    console.log('connectToChatServer');
    const _socket = io('http://localhost:3000', {
      autoConnect: false,
      query: {
        username: username,
      },
    });
    _socket.connect();
    setSocket(_socket);
    setUsername('');
  };

  const disconnectToChatServer = () => {
    console.log(`사용자가 나갔습니다.`);
    socket?.disconnect();
  };

  const onConnected = () => {
    console.log('프론트 - onConnected');
    setIsConnected(true);
  };

  const onDisconnected = () => {
    console.log('프론트 - onConnected');
    setIsConnected(false);
  };

  const sendMessageToChatServer = () => {
    console.log(`프론트 - sendMessageToChatServer. input: ${userInput}`);
    socket?.emit(
      'new message',
      { username, message: userInput },
      (response) => {
        console.log(response);
      }
    );
    setUserInput('');
  };

  const onMessageReceived = (msg) => {
    console.log('프론트 - onMessageReceived');
    console.log(msg);
    setMessages((prev) => [...prev, msg]);
  };

  useEffect(() => {
    console.log('useEffect scroll!');
    scrollTo({ top: document.body.scrollHeight, left: 0, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    console.log('useEffect callied!');
    socket?.on('connect', onConnected);
    socket?.on('disconnect', onDisconnected);
    socket?.on('new message', onMessageReceived);

    return () => {
      console.log('useEffect clean up function');
      socket?.off('connect', onConnected);
      socket?.off('disconnect', onDisconnected);
      socket?.off('new message', onMessageReceived);
    };
  }, [socket]);

  const messageList = messages.map((aMsg, index) => (
    <li key={index}>
      {aMsg.username} : {aMsg.message}
    </li>
  ));

  return (
    <div>
      <div className="main">
        <h2 className="username-display">사용자 이름 : {username}</h2>
        <h3 className="connection-status">
          접속상태 : {isConnected ? '접속중..' : '미접속중..'}
        </h3>
        <div className="card">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
            placeholder="Enter username"
          />
          <button onClick={connectToChatServer} className="connect-btn">
            접속
          </button>
          <button onClick={disconnectToChatServer} className="disconnect-btn">
            접속종료
          </button>
        </div>
      </div>

      {isConnected && (
        <div className="card">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="input-field"
            placeholder="Enter message"
          />
          <button onClick={sendMessageToChatServer} className="send-btn">
            전송
          </button>
        </div>
      )}
      <ul className="message-list">{messageList}</ul>
    </div>
  );
}

export default App;
