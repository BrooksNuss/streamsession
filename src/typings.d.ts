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
