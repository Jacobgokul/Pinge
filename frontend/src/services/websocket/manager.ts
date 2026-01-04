type MessageHandler = (data: unknown) => void;

// Backend sends messages in this format
interface WSMessage {
  event: string;
  data: unknown;
}

/**
 * WebSocket connection manager
 * Handles connection, reconnection, and message routing
 */
class WebSocketManager {
  private socket: WebSocket | null = null;
  private handlers = new Map<string, Set<MessageHandler>>();
  private reconnectAttempts = 0;
  private maxReconnects = 5;
  private reconnectDelay = 2000;
  private token: string | null = null;

  /**
   * Connect to WebSocket server
   */
  connect(token: string): void {
    // Don't reconnect if already connected
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    this.token = token;
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

    try {
      this.socket = new WebSocket(`${wsUrl}/ws?token=${token}`);
      this.setupEventHandlers();
    } catch (error) {
      console.error('[WS] Connection error:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Set up WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.onopen = () => {
      console.log('[WS] Connected');
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (wsEvent) => {
      try {
        const message: WSMessage = JSON.parse(wsEvent.data);
        // Emit with event type, passing the full message (event + data)
        this.emit(message.event, message);
      } catch (error) {
        console.error('[WS] Parse error:', error);
      }
    };

    this.socket.onclose = (event) => {
      console.log('[WS] Disconnected:', event.code, event.reason);
      this.scheduleReconnect();
    };

    this.socket.onerror = (error) => {
      console.error('[WS] Error:', error);
    };
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnects) {
      console.error('[WS] Max reconnection attempts reached');
      return;
    }

    if (!this.token) {
      console.log('[WS] No token, skipping reconnect');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (this.token) {
        this.connect(this.token);
      }
    }, delay);
  }

  /**
   * Subscribe to a message type
   * Returns unsubscribe function
   */
  subscribe(type: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }

    this.handlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  /**
   * Emit event to all subscribed handlers
   */
  private emit(type: string, payload: unknown): void {
    const handlers = this.handlers.get(type);
    if (handlers) {
      handlers.forEach((handler) => handler(payload));
    }
  }

  /**
   * Send message through WebSocket
   */
  send(type: string, payload: unknown): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('[WS] Cannot send - not connected');
    }
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    this.token = null;
    this.reconnectAttempts = this.maxReconnects; // Prevent reconnection

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * Check if connected
   */
  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export const wsManager = new WebSocketManager();
