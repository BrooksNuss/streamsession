import { Injectable, OnInit }    from '@angular/core';

@Injectable()
export class AudioContextService {
	audioContext: AudioContext;
	audioSource: MediaStreamAudioSourceNode; 
	
	init(): Promise<MediaStream> {
		this.audioContext = new AudioContext();
		return navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    	// .then(mediaStream => {
    	// 	this.audioSource = this.audioContext.createMediaStreamSource(mediaStream);
    	// });
	}

	setAudioContext(ac: AudioContext) {
		this.audioContext = ac;
	} 

	setAudioSource(source: MediaStreamAudioSourceNode) {
		this.audioSource = source;
	}

	getAudioContext(): AudioContext {
		return this.audioContext;
	}

	getAudioSource(): MediaStreamAudioSourceNode {
		return this.audioSource;
	}
}