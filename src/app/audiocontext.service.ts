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

	powerToggle(pedal: Pedal, power: boolean): void {
		//Index of current pedal
		let index = this.pedalArr.indexOf(pedal);
		//Preceding and succeeding nodes/pedals


		//Use a while loop to find next available pedal to connect to.
		//If none, connect to the node.


		let i = index;
		let prevNode;
		let nextNode;
		while(i>0){prevNode = this.pedalArr[index - 1]; i--;}
		while(i<this.pedalArr.length){nextNode = this.pedalArr[index + 1]; i++;}
		console.log("prevNode "+prevNode);
		console.log("nextNode "+nextNode)
		//Determine if prev/next nodes are nodes or pedals.
		//If pedals, reference output of prev and input of next
		if(nextNode instanceof Pedal)
			nextNode = nextNode.input;
		if(prevNode instanceof Pedal)
			prevNode = prevNode.output;
		//If power is true, turn on the pedal, else turn it off.
		//This is done by simply bypassing the pedal in the chain.
		if(power) {
			//use connect(pedal.input) for everything.
			prevNode.connect(pedal.input);
			prevNode.disconnect(nextNode);
		} else {
			prevNode.disconnect(pedal.input);
			prevNode.connect(nextNode);
		}
	}

	getPedalArr(): any[] {
		return this.pedalArr;
	}
}