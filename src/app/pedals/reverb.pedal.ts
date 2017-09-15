import { Component, ViewChild, ElementRef } from '@angular/core';
import { AudioContextService } from '../audiocontext.service';
import { Pedal } from './pedal';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'reverb-pedal',
  templateUrl: './reverb.pedal.html'
})

export class ReverbPedal extends Pedal{
	audioContext:AudioContext;
	//audioSource:MediaStreamAudioSourceNode;
	reverbNode:ConvolverNode;
	volumeNode:GainNode;

	//Adjustable values for this pedal
	//The names of these values should be pushed to nodeNames
	//	for proper display in the template and updating from template
	Type = 0;
	Level = 50;
	bufferArr = [];
	http:HttpClient;

	constructor(protected audioContextService: AudioContextService){
		super(audioContextService);
		this.audioContext = this.audioContextService.getAudioContext();
		this.http = this.audioContextService.getHttpClient();
		this.pedalName = "Reverb";
		this.reverbNode = this.audioContext.createConvolver();
		this.volumeNode = this.audioContext.createGain();

		var source = this.audioContext.createBufferSource();
		this.http.get('/assets/impulses/GuitarHack JJ EDGE-1.wav',
			{responseType: 'arraybuffer'}).subscribe(data => {
				this.audioContext.decodeAudioData(data).then((buffer) => {
					this.reverbNode.buffer = buffer;
					//this.bufferArr.push(buffer);
				})
			}
		);

		this.internalNodes.push(this.reverbNode);
		this.internalNodes.push(this.reverbNode.connect(this.volumeNode));
		this.nodeNames.push("Type");
		this.nodeNames.push("Level");
		this.input = this.internalNodes[0];
		this.output = this.internalNodes[this.internalNodes.length - 1];
	}

	updateValues(event: any, index: number): void {
		this[this.nodeNames[index]] = event.value;
		this.volumeNode.gain.value = .01 * this.Level;
		//acquire value between 0 and 5
		//this.Type = this.Type/20;
		//this.reverbNode.buffer = this.bufferArr[this.Type];
	}
}