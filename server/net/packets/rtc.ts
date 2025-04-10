
export enum CameraType {
    ADMIN = 0,
    STREAM_BUFFER0 = 1,
    STREAM_BUFFER1 = 2
};

export interface ExposeCameraChannel {
    camera: string;
};
export interface EnableCameraChannel {
    channel: string;
    buffer:  CameraType;
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
    enableCamera:  (enableRequest: EnableCameraChannel) => void;
    exposeChannel: (exposeRequest: ExposeCameraChannel) => void;

    rtcOffer:        (offer: PacketRTCCameraOffer)      => void;
    rtcAnswer:       (answer: PacketRTCCameraAnswer)    => void;
    rtcIceCandidate: (candidate: PacketRTCIceCandidate) => void;
};
