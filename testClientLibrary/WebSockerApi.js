// @ts-check
/**
 * WebSockerApi.js
 * Browser WebSocket API for Texas Hold'em client
 * Connects to ws://localhost:8080
 * Command/message protocol based on /common/Common.ts and /common/Game.ts
 * Exposes global window.WebSockerApi
 */

(function (global) {
    const WS_URL = 'ws://localhost:8080';
    const RECONNECT_MAX_ATTEMPTS = 5;
    const RECONNECT_BASE_DELAY = 1000; // ms

    // --- Command Kinds (from common/Game.ts) ---
    const CommandKind = {
        RegisterUser: 'register_user',
        GameStateUpdate: 'game_state_update',
        ConnectToGame: 'connect_to_game',
        Error: 'error',
        LeaveGame: 'leave_game',
        NeedRefreshAllStates: 'need_refresh_all_states',
        GameAction: 'game_action',
        StartGame: 'start_game',
    };

    // --- Command Generators ---
    const CommandGenerators = {
        registerUser: (uniqueId, name, avatarUrl) => ({
            kind: CommandKind.RegisterUser,
            data: { uniqueId, name, avatarUrl },
        }),
        gameAction: (action, amount) => ({
            kind: CommandKind.GameAction,
            data: { action, amount },
        }),
        connectToGame: (gameState) => ({
            kind: CommandKind.ConnectToGame,
            data: gameState,
        }),
        leaveGame: () => ({
            kind: CommandKind.LeaveGame,
            data: undefined,
        }),
        gameStateUpdate: () => ({
            kind: CommandKind.GameStateUpdate,
            data: undefined,
        }),
        needRefreshAllStates: () => ({
            kind: CommandKind.NeedRefreshAllStates,
            data: undefined,
        }),
        startGame: () => ({
            kind: CommandKind.StartGame,
            data: undefined,
        }),
    };

    // --- Response Classes (from common/Game.ts & Common.ts) ---
    class ClientError {
        constructor(obj) {
            this.message = obj && obj.message;
        }
    }
    class ClientUser {
        constructor(obj) {
            this.uniqueId = obj && obj.uniqueId;
            this.name = obj && obj.name;
            this.balance = obj && obj.balance;
            this.avatarUrl = obj && obj.avatarUrl;
        }
    }
    class Card {
        constructor(obj) {
            this.suit = obj && obj.suit;
            this.rank = obj && obj.rank;
        }
    }
    class ClientOtherUser {
        constructor(obj) {
            this.name = obj && obj.name;
            this.cardsInHandNum = obj && obj.cardsInHandNum;
            this.currentBet = obj && obj.currentBet;
        }
    }
    class ClientGameState {
        constructor(obj) {
            this.currentUser = obj && obj.currentUser ? new ClientUser(obj.currentUser) : undefined;
            this.users = obj && obj.users ? obj.users.map(u => new ClientOtherUser(u)) : [];
            this.cardsInHand = obj && obj.cardsInHand ? obj.cardsInHand.map(c => new Card(c)) : [];
            this.cardsOnTable = obj && obj.cardsOnTable ? obj.cardsOnTable.map(c => new Card(c)) : [];
            this.currentBet = obj && obj.currentBet;
            this.allowedActions = obj && obj.allowedActions ? obj.allowedActions.slice() : [];
        }
    }
    class NeedRefreshAllStatesResponse {
        constructor(obj) {
            this.kind = CommandKind.NeedRefreshAllStates;
        }
    }
    class GameStateUpdateResponse {
        constructor(obj) {
            this.kind = CommandKind.GameStateUpdate;
            this.data = obj && obj.data ? new ClientGameState(obj.data) : undefined;
        }
    }
    class LeaveGameResponse {
        constructor(obj) {
            this.kind = CommandKind.LeaveGame;
            this.data = undefined;
        }
    }
    class ErrorResponse {
        constructor(obj) {
            this.kind = CommandKind.Error;
            this.data = obj && obj.data ? new ClientError(obj.data) : undefined;
        }
    }
    // --- Response class mapping by kind ---
    const ResponseClassByKind = {
        [CommandKind.GameStateUpdate]: GameStateUpdateResponse,
        [CommandKind.LeaveGame]: LeaveGameResponse,
        [CommandKind.Error]: ErrorResponse,
        [CommandKind.NeedRefreshAllStates]: NeedRefreshAllStatesResponse,
        [CommandKind.RegisterUser]: GameStateUpdateResponse,
        [CommandKind.ConnectToGame]: GameStateUpdateResponse,
        [CommandKind.GameAction]: GameStateUpdateResponse,
        [CommandKind.StartGame]: GameStateUpdateResponse,
    };

    // --- WebSockerApi Implementation ---
    function WebSockerApi() {
        this.ws = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.messageHandlers = new Map(); // kind -> [handler]
        this.connectionHandlers = [];
        this.disconnectionHandlers = [];
        this.errorHandlers = [];
    }

    WebSockerApi.prototype.connect = function () {
        if (this.ws) {
            this.ws.close();
        }
        this.ws = new WebSocket(WS_URL);
        this.ws.onopen = (event) => {
            this.connected = true;
            this.reconnectAttempts = 0;
            if (global['isDebug']) console.log('[WebSockerApi] Connected');
            this.connectionHandlers.forEach(h => { try { h(event); } catch (e) { console.error(e); } });
        };
        this.ws.onclose = (event) => {
            this.connected = false;
            if (global['isDebug']) console.log('[WebSockerApi] Disconnected', event.code, event.reason);
            this.disconnectionHandlers.forEach(h => { try { h(event); } catch (e) { console.error(e); } });
            if (event.code !== 1000 && this.reconnectAttempts < RECONNECT_MAX_ATTEMPTS) {
                this._reconnect();
            }
        };
        this.ws.onerror = (error) => {
            if (global['isDebug']) console.error('[WebSockerApi] Error', error);
            this.errorHandlers.forEach(h => { try { h(error); } catch (e) { console.error(e); } });
        };
        this.ws.onmessage = (event) => {
            let msg;
            try {
                msg = JSON.parse(event.data);
            } catch (e) {
                if (global['isDebug']) console.warn('[WebSockerApi] Non-JSON message', event.data);
                msg = { kind: 'raw', data: event.data };
            }
            this._handleMessage(msg);
        };
    };

    WebSockerApi.prototype._reconnect = function () {
        this.reconnectAttempts++;
        const delay = RECONNECT_BASE_DELAY * Math.pow(2, this.reconnectAttempts - 1);
        if (global['isDebug']) console.log(`[WebSockerApi] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
        setTimeout(() => this._connect(), delay);
    };

    WebSockerApi.prototype._handleMessage = function (msg) {
        if (global['isDebug']) console.log('[WebSockerApi] Received', msg);
        const kind = msg.kind || 'unknown';
        let responseObj = msg;
        if (ResponseClassByKind[kind]) {
            responseObj = new ResponseClassByKind[kind](msg);
        }
        if (this.messageHandlers.has(kind)) {
            this.messageHandlers.get(kind).forEach(h => { try { h(responseObj); } catch (e) { console.error(e); } });
        } else if (global['isDebug']) {
            console.log(`[WebSockerApi] No handlers for kind '${kind}'`);
        }
    };

    WebSockerApi.prototype.send = function (command) {
        if (!this.connected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
            if (global['isDebug']) console.warn('[WebSockerApi] Not connected');
            return false;
        }
        try {
            this.ws.send(JSON.stringify(command));
            if (global['isDebug']) console.log('[WebSockerApi] Sent', command);
            return true;
        } catch (e) {
            console.error('[WebSockerApi] Send failed', e);
            return false;
        }
    };

    /**
     * Register a handler for a specific message kind.
     * Handler will receive an instance of the correct response class for that kind.
     * @param {string} kind - One of CommandKind
     * @param {Function} handler - Handler signature by kind:
     *   - GameStateUpdate, RegisterUser, ConnectToGame, GameAction, StartGame: (resp: GameStateUpdateResponse)
     *   - LeaveGame: (resp: LeaveGameResponse)
     *   - Error: (resp: ErrorResponse)
     *   - NeedRefreshAllStates: (resp: NeedRefreshAllStatesResponse)
     */
    WebSockerApi.prototype.on = function (kind, handler) {
        if (!this.messageHandlers.has(kind)) {
            this.messageHandlers.set(kind, []);
        }
        this.messageHandlers.get(kind).push(handler);
    };

    WebSockerApi.prototype.off = function (kind, handler) {
        if (this.messageHandlers.has(kind)) {
            const arr = this.messageHandlers.get(kind);
            const idx = arr.indexOf(handler);
            if (idx > -1) arr.splice(idx, 1);
        }
    };

    WebSockerApi.prototype.onConnect = function (handler) {
        this.connectionHandlers.push(handler);
    };
    WebSockerApi.prototype.onDisconnect = function (handler) {
        this.disconnectionHandlers.push(handler);
    };
    WebSockerApi.prototype.onError = function (handler) {
        this.errorHandlers.push(handler);
    };
    WebSockerApi.prototype.disconnect = function () {
        if (this.ws) this.ws.close(1000, 'Manual disconnect');
    };
    WebSockerApi.prototype.isConnected = function () {
        return this.connected && this.ws && this.ws.readyState === WebSocket.OPEN;
    };
    WebSockerApi.prototype.getReadyState = function () {
        return this.ws ? this.ws.readyState : WebSocket.CLOSED;
    };

    // Expose command generators for convenience
    WebSockerApi.prototype.commands = CommandGenerators;
    WebSockerApi.prototype.CommandKind = CommandKind;

    // Singleton instance
    const api = new WebSockerApi();
    global['WebSockerApi'] = api;

})(window);
