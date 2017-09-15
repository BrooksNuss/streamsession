import { Injectable, OnInit }    from '@angular/core';
import { Pedal } from './pedals/pedal';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AudioContextService {
	audioContext: AudioContext;
	audioSource: MediaStreamAudioSourceNode;
	pedalArr = [];

	constructor(protected http: HttpClient){}
	
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

	getHttpClient(): HttpClient {
		return this.http;
	}

	addNode(node: AudioNode): void {
		this.pedalArr.push(node);
	}

	addPedal(pedal: Pedal): void {
		this.pedalArr.push(pedal);
	}

	removeNode(node: AudioNode): void {
		let index = this.pedalArr.indexOf(node);
		this.pedalArr.splice(index, 1);
	}

	removePedal(pedal: Pedal): void {
		let index = this.pedalArr.indexOf(pedal);
		this.pedalArr.splice(index, 1);
	}
}