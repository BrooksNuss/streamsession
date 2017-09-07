import { Injectable, OnInit }    from '@angular/core';

@Injectable()
export class AudioContextService {
	audioContext: AudioContext;
	audioSource: MediaStreamAudioSourceNode;
	pedalArr = [];
	
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

	addNode(pedal: AudioNode): void {
		this.pedalArr.push(pedal);
	}

	removeNode(pedal: AudioNode): void {
		let index = this.pedalArr.indexOf(pedal);
		this.pedalArr.splice(index, 1);
	}
}