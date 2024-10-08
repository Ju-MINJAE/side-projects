import { useEffect, useReducer } from 'react';
import './App.css';
import { io } from 'socket.io-client';

const initialState = {
  socket: null,
  username: '',
  userInput: '',
  isConnected: false,
  messages: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SOCKET':
      return { ...state, socket: action.payload };
    case 'USER_NAME':
      return { ...state, username: action.payload };
    case 'USER_INPUT':
      return { ...state, userInput: action.payload };
    case 'IS_CONNECTED':
      return { ...state, isConnected: !state.isConnected };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };
    default:
      return state;
  }
};

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { socket, username, userInput, isConnected, messages } = state;

  const connectToChatServer = () => {
    console.log('connectToChatServer');
    const _socket = io('http://localhost:3000', {
      autoConnect: false,
      query: { username },
    });
    _socket.connect();
    dispatch({ type: 'SOCKET', payload: _socket });
  };

  const disconnectToChatServer = () => {
    console.log('사용자가 나갔습니다.');
    socket?.disconnect();
  };

  const onConnected = () => {
    console.log('프론트 - onConnected');
    dispatch({ type: 'IS_CONNECTED' });
  };

  const onDisconnected = () => {
    console.log('프론트 - onDisconnected');
    dispatch({ type: 'IS_CONNECTED' });
    dispatch({ type: 'USER_NAME', payload: '' });
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
    dispatch({ type: 'USER_INPUT', payload: '' });
  };

  const onMessageReceived = (msg) => {
    console.log('프론트 - onMessageReceived');
    console.log(msg);
    dispatch({ type: 'ADD_MESSAGE', payload: msg });
  };

  useEffect(() => {
    console.log('useEffect scroll!');
    scrollTo({ top: document.body.scrollHeight, left: 0, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    console.log('useEffect called!');
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
            onChange={(e) =>
              dispatch({ type: 'USER_NAME', payload: e.target.value })
            }
            className="input-field"
            placeholder="Enter username"
          />
          {!isConnected && (
            <button onClick={connectToChatServer} className="connect-btn">
              접속
            </button>
          )}
          {isConnected && (
            <button onClick={disconnectToChatServer} className="disconnect-btn">
              접속종료
            </button>
          )}
        </div>
      </div>

      {isConnected && (
        <div className="card">
          <input
            type="text"
            value={userInput}
            onChange={(e) =>
              dispatch({ type: 'USER_INPUT', payload: e.target.value })
            }
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
