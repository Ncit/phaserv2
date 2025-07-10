import React, { useEffect } from 'react';
import { ClientGameState } from './common/Game';

type GamePageProps = {
  gameState: ClientGameState;
  userUniqueId: string;
  sendJson: (obj: any) => void;
  connected: boolean;
};

const GamePage: React.FC<GamePageProps> = ({
  gameState,
  userUniqueId,
  sendJson,
  connected,
}) => {
  const handleLeaveGame = () => {
    sendJson({ kind: 'leave_game', data: undefined, userUniqueId });
  };

  const handleReady = () => {
    sendJson({ kind: 'update_ready', data: true, userUniqueId });
  };

  const handleRefreshGameState = () => {
    sendJson({ kind: 'game_state_update', userUniqueId });
  };

  return (
    <div style={{ border: '1px solid #eee', padding: 10, marginBottom: 10 }}>
      <div style={{ marginBottom: 8 }}>
        <button onClick={handleLeaveGame} disabled={!connected}>Leave Game</button>
        <button onClick={handleReady} disabled={!connected} style={{ marginLeft: 8 }}>Ready</button>
        <button onClick={handleRefreshGameState} disabled={!connected} style={{ marginLeft: 8 }}>Refresh Game State</button>
      </div>
      {/* Display basic game state info */}
      <div style={{ marginTop: 16, padding: 8, border: '1px solid #ccc' }}>
        <div><b>Current User:</b> {gameState.currentUser?.name} ({gameState.currentUser?.uniqueId})</div>
      </div>
      {/* Table of all users in the game */}
      <div style={{ marginTop: 16 }}>
        <b>Players:</b>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: 4 }}>Name</th>
              <th style={{ border: '1px solid #ccc', padding: 4 }}>Unique ID</th>
              <th style={{ border: '1px solid #ccc', padding: 4 }}>Cards In Hand</th>
              <th style={{ border: '1px solid #ccc', padding: 4 }}>Current Bid</th>
              <th style={{ border: '1px solid #ccc', padding: 4 }}>Is Ready</th>
            </tr>
          </thead>
          <tbody>
            {/* Current user row */}
            <tr>
              <td style={{ border: '1px solid #ccc', padding: 4 }}>{gameState.currentUser?.name}</td>
              <td style={{ border: '1px solid #ccc', padding: 4 }}>{gameState.currentUser?.uniqueId}</td>
              <td style={{ border: '1px solid #ccc', padding: 4 }}>{gameState.cardsInHand?.length ?? '-'}</td>
              <td style={{ border: '1px solid #ccc', padding: 4 }}>{gameState.currentBid ?? '-'}</td>
              <td style={{ border: '1px solid #ccc', padding: 4 }}>-</td>
            </tr>
            {/* Other users rows */}
            {gameState.users?.map((user, idx) => (
              <tr key={user.name + idx}>
                <td style={{ border: '1px solid #ccc', padding: 4 }}>{user.name}</td>
                <td style={{ border: '1px solid #ccc', padding: 4 }}>-</td>
                <td style={{ border: '1px solid #ccc', padding: 4 }}>{user.cardsInHandNum}</td>
                <td style={{ border: '1px solid #ccc', padding: 4 }}>{user.currentBid}</td>
                <td style={{ border: '1px solid #ccc', padding: 4 }}>{user.isReady ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GamePage; 