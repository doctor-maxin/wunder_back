export interface ServerToClientEvents {
  pong: () => void;
}
export interface ClientToServerEvents {
  ping: () => void;
}
