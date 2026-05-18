/**
 * WebSocket Optimizer
 * Optimizes WebSocket connections for better performance
 */

class WebSocketOptimizer {
  constructor(io) {
    this.io = io;
    this.rooms = new Map();
    this.userSockets = new Map();
    this.messageQueue = new Map();
    this.batchInterval = 50; // 50ms batch window
  }

  /**
   * Initialize optimized WebSocket handlers
   */
  initialize() {
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });

    // Start batch processing
    this.startBatchProcessing();
  }

  /**
   * Handle new connection
   */
  handleConnection(socket) {
    console.log('Optimized connection:', socket.id);

    // Track user socket
    if (socket.handshake.query.userId) {
      this.userSockets.set(socket.handshake.query.userId, socket.id);
    }

    // Join room handler
    socket.on('join-room', (roomId) => {
      this.joinRoom(socket, roomId);
    });

    // Leave room handler
    socket.on('leave-room', (roomId) => {
      this.leaveRoom(socket, roomId);
    });

    // Batched message handler
    socket.on('message', (data) => {
      this.queueMessage(socket, data);
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      this.handleDisconnect(socket);
    });
  }

  /**
   * Join room with optimization
   */
  joinRoom(socket, roomId) {
    socket.join(roomId);

    // Track room members
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId).add(socket.id);

    // Notify others (batched)
    this.queueBroadcast(roomId, 'user-joined', {
      userId: socket.id,
      timestamp: Date.now()
    }, socket.id);
  }

  /**
   * Leave room with cleanup
   */
  leaveRoom(socket, roomId) {
    socket.leave(roomId);

    // Update room tracking
    if (this.rooms.has(roomId)) {
      this.rooms.get(roomId).delete(socket.id);
      
      // Clean up empty rooms
      if (this.rooms.get(roomId).size === 0) {
        this.rooms.delete(roomId);
      }
    }

    // Notify others (batched)
    this.queueBroadcast(roomId, 'user-left', {
      userId: socket.id,
      timestamp: Date.now()
    }, socket.id);
  }

  /**
   * Queue message for batching
   */
  queueMessage(socket, data) {
    const { roomId, event, payload } = data;

    if (!this.messageQueue.has(roomId)) {
      this.messageQueue.set(roomId, []);
    }

    this.messageQueue.get(roomId).push({
      event,
      payload,
      senderId: socket.id,
      timestamp: Date.now()
    });
  }

  /**
   * Queue broadcast for batching
   */
  queueBroadcast(roomId, event, payload, excludeSocketId = null) {
    if (!this.messageQueue.has(roomId)) {
      this.messageQueue.set(roomId, []);
    }

    this.messageQueue.get(roomId).push({
      event,
      payload,
      excludeSocketId,
      timestamp: Date.now()
    });
  }

  /**
   * Start batch processing
   */
  startBatchProcessing() {
    setInterval(() => {
      this.processBatches();
    }, this.batchInterval);
  }

  /**
   * Process batched messages
   */
  processBatches() {
    for (const [roomId, messages] of this.messageQueue.entries()) {
      if (messages.length === 0) continue;

      // Group messages by event type
      const grouped = messages.reduce((acc, msg) => {
        if (!acc[msg.event]) {
          acc[msg.event] = [];
        }
        acc[msg.event].push(msg);
        return acc;
      }, {});

      // Send batched messages
      for (const [event, msgs] of Object.entries(grouped)) {
        const excludeIds = msgs
          .map(m => m.excludeSocketId)
          .filter(Boolean);

        // Broadcast to room
        this.io.to(roomId).except(excludeIds).emit(event, {
          batch: true,
          messages: msgs.map(m => m.payload),
          count: msgs.length
        });
      }

      // Clear processed messages
      this.messageQueue.set(roomId, []);
    }
  }

  /**
   * Handle disconnect
   */
  handleDisconnect(socket) {
    console.log('Optimized disconnect:', socket.id);

    // Remove from user tracking
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === socket.id) {
        this.userSockets.delete(userId);
        break;
      }
    }

    // Remove from all rooms
    for (const [roomId, members] of this.rooms.entries()) {
      if (members.has(socket.id)) {
        members.delete(socket.id);
        
        // Notify room
        this.queueBroadcast(roomId, 'user-left', {
          userId: socket.id,
          timestamp: Date.now()
        });

        // Clean up empty rooms
        if (members.size === 0) {
          this.rooms.delete(roomId);
        }
      }
    }
  }

  /**
   * Get room statistics
   */
  getRoomStats(roomId) {
    return {
      roomId,
      members: this.rooms.has(roomId) ? this.rooms.get(roomId).size : 0,
      queuedMessages: this.messageQueue.has(roomId) ? this.messageQueue.get(roomId).length : 0
    };
  }

  /**
   * Get all rooms statistics
   */
  getAllStats() {
    const stats = {
      totalRooms: this.rooms.size,
      totalConnections: this.userSockets.size,
      rooms: []
    };

    for (const roomId of this.rooms.keys()) {
      stats.rooms.push(this.getRoomStats(roomId));
    }

    return stats;
  }

  /**
   * Broadcast to specific users
   */
  broadcastToUsers(userIds, event, payload) {
    const socketIds = userIds
      .map(userId => this.userSockets.get(userId))
      .filter(Boolean);

    socketIds.forEach(socketId => {
      this.io.to(socketId).emit(event, payload);
    });
  }

  /**
   * Send to specific user
   */
  sendToUser(userId, event, payload) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, payload);
    }
  }
}

module.exports = WebSocketOptimizer;
