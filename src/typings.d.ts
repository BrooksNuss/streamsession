/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

interface MediaStreamAudioDestinationNode extends AudioNode {
    stream: MediaStream;
}

declare var MediaStreamAudioDestinationNode: {
    prototype: MediaStreamAudioDestinationNode;
    new(): MediaStreamAudioDestinationNode;
}

interface AudioContext extends AudioContextBase {
    // suspend(): Promise<void>;
    // resume(): Promise<void>;
    // close(): Promise<void>;
    createMediaStreamDestination(): MediaStreamAudioDestinationNode; 
}

declare var AudioContext: {
    prototype: AudioContext;
    new(): AudioContext;
}

type EventHandler = (event: Event) => void;

interface RTCDataChannel extends EventTarget {
    readonly label: string;
    readonly ordered: boolean;
    readonly maxPacketLifeTime: number | null;
    readonly maxRetransmits: number | null;
    readonly protocol: string;
    readonly negotiated: boolean;
    readonly id: number;
    readonly readyState: RTCDataChannelState;
    readonly bufferedAmount: number;
    bufferedAmountLowThreshold: number;
    binaryType: RTCBinaryType;

    close(): void;
    send(data: string | Blob | ArrayBuffer | ArrayBufferView): void;

    onopen: EventHandler;
    onmessage: (event: MessageEvent) => void;
    onbufferedamountlow: EventHandler;
    onerror: (event: ErrorEvent) => void;
    onclose: EventHandler;
}

interface RTCPeerConnection extends EventTarget {
    createDataChannel(label: string | null, dataChannelDict?: RTCDataChannelInit): RTCDataChannel;
    createDataChannel(label: string | null, dataChannelDict?: RTCDataChannelInit): RTCDataChannel;
    ondatachannel: (event:     RTCDataChannelEvent) => void;

}

interface RTCDataChannelInit {
    ordered?: boolean; // default = true
    maxPacketLifeTime?: number;
    maxRetransmits?: number;
    protocol?: string; // default = ''
    negotiated?: boolean; // default = false
    id?: number;
}

declare var RTCPeerConnection: {
    new(configuration: RTCConfiguration): RTCPeerConnection;
    prototype: RTCPeerConnection;
}

interface RTCDataChannelEvent {
    readonly channel: RTCDataChannel;
}

type RTCDataChannelState = 'connecting' | 'open' | 'closing' | 'closed';
type RTCBinaryType = 'blob' | 'arraybuffer';