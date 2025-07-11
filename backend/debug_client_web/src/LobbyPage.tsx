import React, { useState } from 'react';
import { ClientLobbyState } from './common/Lobby';
import { ClientLobbyCommandKind } from './common/Lobby';

type LobbyPageProps = {
  lobbyState: ClientLobbyState | null;
  userUniqueId: string;
  sendJson: (obj: any) => void;
  connected: boolean;
  setUserUniqueId: (id: string) => void;
};

const LobbyPage: React.FC<LobbyPageProps> = ({
  lobbyState,
  userUniqueId,
  sendJson,
  connected,
  setUserUniqueId,
}) => {
  const [setName, setSetName] = useState('');

  const [newUserUniqueId, setNewUserUniqueId] = useState('');


  const handleSetName = () => {
    sendJson({ kind: ClientLobbyCommandKind.SetUserName, data: setName, userUniqueId });
  };
  const handleGetLobby = () => {
    sendJson({ kind: ClientLobbyCommandKind.GetLobbyState, data: undefined, userUniqueId });
  };
  // Remove handleCreateRoom, handleJoinRoom, handleLeaveRoom, handleGetRooms
  const handleSetOldUniqueId = () => {
    sendJson({ kind: ClientLobbyCommandKind.SetOldUniqueId, data:newUserUniqueId , userUniqueId: userUniqueId });
    localStorage.setItem('userUniqueId', newUserUniqueId);
  };
  const handleEnterGame = () => {
    sendJson({ kind: ClientLobbyCommandKind.EnterGame, data: undefined, userUniqueId });
  };

  return (
    <div style={{ border: '1px solid #eee', padding: 10, marginBottom: 10 }}>
      <div style={{ marginBottom: 8 }}>
        <input
          value={newUserUniqueId}
          onChange={e => {
            setNewUserUniqueId(e.target.value);
          }}
          placeholder="New Unique ID (from server)"
          style={{ width: '60%', marginRight: 8 }}
          disabled={!connected}
        />
        <button onClick={handleSetOldUniqueId} disabled={!connected || !userUniqueId }>Set Old Unique ID (Restore Session)</button>
      </div>
      <div style={{ marginBottom: 8 }}>
        <input
          value={setName}
          onChange={e => setSetName(e.target.value)}
          placeholder="Set User Name"
          style={{ width: '60%', marginRight: 8 }}
          disabled={!connected}
        />
        <button onClick={handleSetName} disabled={!connected || !userUniqueId || !setName}>Set User Name</button>
      </div>
      <div style={{ marginBottom: 8 }}>
        <button onClick={handleGetLobby} disabled={!connected || !userUniqueId}>Get Lobby State</button>
      </div>
      <div style={{ marginBottom: 8 }}>
        <button onClick={handleEnterGame} disabled={!connected || !userUniqueId}>Enter Game</button>
      </div>
      {/* Optionally render lobbyState info here */}
      {lobbyState && (
        <div style={{ marginTop: 16, padding: 8, border: '1px solid #ccc' }}>
          <div><b>Current User:</b> {lobbyState.currentUser?.name} ({lobbyState.currentUser?.uniqueId})</div>
        </div>
      )}
    </div>
  );
};

export default LobbyPage; 