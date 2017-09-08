import { Injectable, OnInit }    from '@angular/core';
import { Pedal } from './pedals/pedal';

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

	powerToggle(pedal: Pedal, power: boolean): void {
		let index = this.pedalArr.indexOf(pedal);
		if(index>0 && index<this.pedalArr.length) {
			if(power) {
				this.pedalArr[index - 1].connect(pedal);
				this.pedalArr[index - 1].disconnect(this.pedalArr[index + 1]);
			} else {
				this.pedalArr[index - 1].disconnect(pedal);
				this.pedalArr[index - 1].connect(this.pedalArr[index + 1]);
			}
		}
	}

	getPedalArr(): any[] {
		return this.pedalArr;
	}
}