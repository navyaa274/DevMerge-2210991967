import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5002';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    connect(token) {
        if (this.socket?.connected) return;

        try {
            this.socket = io(SOCKET_URL, {
                auth: { token },
                transports: ['websocket', 'polling'],
                reconnectionAttempts: 3,
                reconnectionDelay: 2000,
                timeout: 5000,
            });

            this.socket.on('connect', () => {
                console.log('📡 Socket connected:', this.socket.id);
            });

            this.socket.on('disconnect', (reason) => {
                console.log('📡 Socket disconnected:', reason);
            });

            this.socket.on('connect_error', (error) => {
                // Silently handle connection errors to prevent console spam
                console.debug('📡 Socket connection failed (non-critical):', error.message);
            });

            // Re-attach all listeners on reconnect
            this.socket.on('reconnect', () => {
                this.listeners.forEach((callbacks, event) => {
                    callbacks.forEach(cb => this.socket.on(event, cb));
                });
            });
        } catch (error) {
            console.debug('📡 Socket initialization failed (non-critical):', error.message);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);

        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }

        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    emit(event, data) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }
}

export default new SocketService();
