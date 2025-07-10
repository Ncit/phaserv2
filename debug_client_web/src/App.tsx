import React, { useState, useRef, useEffect, useCallback } from 'react';
import LobbyPage from './LobbyPage';
import GamePage from './GamePage';
import { ClientLobbyCommandKind, ClientLobbyState } from './common/Lobby';
import { ClientGameState } from './common/Game';
import { UserState } from './common/Common';

const WS_URL = 'ws://localhost:8080';

function App() {
  const [pageState, setPageState] = useState<UserState>(UserState.InLobby);
  const [lobbyState, setLobbyState] = useState<ClientLobbyState | null>(null);
  const [gameState, setGameState] = useState<ClientGameState | null>(null);
  const [userUniqueId, setUserUniqueId] = useState('');

  const [forceNeedUpdate, setForceNeedUpdate] = useState(0);
  const ws = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);


  useEffect(() => {
    console.log("userUniqueId changed", userUniqueId);
  }, [userUniqueId]);
  
  const connect = () => {
    if (ws.current) ws.current.close();
    ws.current = new window.WebSocket(WS_URL);
    ws.current.onopen = () => {
      setConnected(true);
      setMessages((msgs) => [...msgs, 'Connected to server']);
    };
    ws.current.onmessage = (event) => {
      setMessages((msgs) => [...msgs, `Server: ${event.data.toString()}`]);
      try {
        const msg = JSON.parse(event.data);
        // Handle lobby/game state transitions
        if (msg.kind === 'on_connection' && msg.data && msg.data.uniqueId) {

          const storedId = localStorage.getItem('userUniqueId');
          if (storedId && storedId !== msg.data.uniqueId) {
            console.log("storeid exists", storedId);
            setForceNeedUpdate(forceNeedUpdate + 1);
            setUserUniqueId(storedId);
            sendJson({ kind: ClientLobbyCommandKind.SetOldUniqueId, data:storedId , userUniqueId: userUniqueId });
          }else {
            setUserUniqueId(msg.data.uniqueId);
            localStorage.setItem('userUniqueId', msg.data.uniqueId);
          }
        }
        if (msg.kind === 'get_lobby_state' && msg.data) {
          setLobbyState(msg.data);
          setPageState(msg.userState);            
        }
        if (msg.kind === 'enter_game' && msg.data) {
          setGameState(msg.data);
          setPageState(msg.userState);
        }
        if (msg.kind === 'game_state_update' && msg.data) {
          setGameState(msg.data);
        }
        if (msg.kind === 'leave_game') {
          setGameState(null);
          setPageState(msg.userState);
          // Optionally request lobby state refresh
        }
        // Handle need_refresh_all_states: force refresh of current state
        if (msg.kind === 'need_refresh_all_states') {
          console.log("need_refresh_all_states", msg);
          setPageState(msg.userState);
          setForceNeedUpdate(forceNeedUpdate + 1);
          if (msg.userState === UserState.InLobby) {
            sendJson({ kind: 'get_lobby_state', userUniqueId });
          } else if (msg.userState === UserState.InGame) {
            sendJson({ kind: 'game_state_update', userUniqueId });
          }
        }
      } catch (e) {
        // ignore parse errors
      }
    };
    ws.current.onclose = () => {
      setConnected(false);
      setMessages((msgs) => [...msgs, 'Disconnected from server']);
    };
  };

  const sendJson = useCallback((obj: any) => {
    if (ws.current && connected && userUniqueId) {
      console.log("sendJson", obj, forceNeedUpdate);
      ws.current.send(JSON.stringify(obj));
      setMessages((msgs) => [...msgs, `You: ${JSON.stringify(obj)}`]);
    }
  },[forceNeedUpdate, pageState,
    userUniqueId, forceNeedUpdate]);

  // Effect to request state update when pageState changes
  useEffect(() => {
    if (!connected || !userUniqueId) return;
    if (pageState === UserState.InLobby) {
      sendJson({ kind: 'get_lobby_state', userUniqueId });
    } else if (pageState === UserState.InGame) {
      sendJson({ kind: 'game_state_update', userUniqueId });
    }
  }, [pageState, connected, userUniqueId, sendJson]);

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2>WebSocket Debug Client</h2>
      <button onClick={connect} disabled={connected} style={{ marginBottom: 10 }}>
        {connected ? 'Connected' : 'Connect'}
      </button>
      <div>
        {pageState}
        {gameState && JSON.stringify(gameState)}
      </div>
      {pageState === 'in_lobby' && (
        <LobbyPage
          lobbyState={lobbyState}
          userUniqueId={userUniqueId}
          sendJson={sendJson}
          connected={connected}
          setUserUniqueId={setUserUniqueId}
        />
      )}
      {pageState === 'in_game' && gameState && (
        <GamePage
          gameState={gameState}
          userUniqueId={userUniqueId}
          sendJson={sendJson}
          connected={connected}
        />
      )}
      <div style={{ border: '1px solid #ccc', minHeight: 100, padding: 10, marginBottom: 10 }}>
        {messages.map((msg, idx) => (
          <div key={idx}>{msg}</div>
        ))}
      </div>
    </div>
    
  );
}

export default App;
