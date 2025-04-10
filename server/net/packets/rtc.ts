import { SessionID } from "../session";

export interface RequestBase {
    session_id: SessionID
}

export enum Buffer {
    STREAM_BUFFER0 = 1,
    STREAM_BUFFER1 = 2
};

export enum Response {
    OK,
    NotAuthorized,
    BadCamera
}

export interface ExposeCameraChannel extends RequestBase {
    camera: string;
};
export interface EnableCameraChannel extends RequestBase {
    camera: string;
    channel: string;
    buffer:  Buffer;
};

export interface PacketRTCCameraOffer {
    channel: string;
    offer  : RTCSessionDescription;
};
export interface PacketRTCCameraAnswer {
    channel: string;
    answer : RTCSessionDescription;
};
export interface PacketRTCIceCandidate {
    channel: string;
    packet : RTCIceCandidate;
};

export interface RTCClientToServerEvents {
    enableCamera:  (enableRequest: EnableCameraChannel) => void;
    exposeChannel: (exposeRequest: ExposeCameraChannel) => void;

    rtcOffer:        (offer: PacketRTCCameraOffer) => void;
    rtcAnswer:       (answer: PacketRTCCameraAnswer) => void;
    rtcIceCandidate: (candidate: PacketRTCIceCandidate) => void;
};

export interface RTCServerToClientEvents {
    onEnableCamera:  (enableRequest: Response) => void;
    onExposeChannel: (exposeRequest: Response) => void;
    enableCamera:  (enableRequest: EnableCameraChannel) => void;

    rtcOffer:        (offer: PacketRTCCameraOffer)      => void;
    rtcAnswer:       (answer: PacketRTCCameraAnswer)    => void;
    rtcIceCandidate: (candidate: PacketRTCIceCandidate) => void;
};
