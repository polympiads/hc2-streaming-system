
import { RTCClientToServerEvents, RTCServerToClientEvents } from './packets/rtc.ts';
import { AuthClientToServerEvents, AuthServerToClientEvents } from './packets/session.ts';

export type ClientToServerEvents = AuthClientToServerEvents & RTCClientToServerEvents;
export type ServerToClientEvents = AuthServerToClientEvents & RTCServerToClientEvents;
