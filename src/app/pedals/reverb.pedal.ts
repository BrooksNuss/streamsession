import { Component, ViewChild, ElementRef } from '@angular/core';
import { AudioContextService } from '../audiocontext.service';
import { Pedal } from './pedal';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'Reverb-pedal',
  templateUrl: './reverb.pedal.html'
})

export class ReverbPedal extends Pedal{
	audioContext:AudioContext;
	//audioSource:MediaStreamAudioSourceNode;
	reverbNode:ConvolverNode;
	volumeNode:GainNode;

	//Adjustable values for this pedal
	//The names of these values should be pushed to nodeData
	//	for proper display in the template and updating from template
	// Type = 0;
	// Level = 50;
	bufferArr = [];
	http:HttpClient;

	constructor(protected audioContextService: AudioContextService){
		super(audioContextService);
		this.audioContext = this.audioContextService.getAudioContext();
		this.http = this.audioContextService.getHttpClient();
		this.pedalName = "Reverb";
		this.reverbNode = this.audioContext.createConvolver();
		this.volumeNode = this.audioContext.createGain();

		this.reverbNode.normalize = false;
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
		this.nodeData.push({name: "Type", min: 1, max: 5, value:3});
		this.nodeData.push({name: "Level", min: 1, max: 100, value:50});
		for (var node of this.nodeData) {node.default = node.max/2;}
		this.input = this.internalNodes[0];
		this.output = this.internalNodes[this.internalNodes.length - 1];
	}

	updateValues(event: any, index: number): void {
		var newVal = this.nodeData[index];
		newVal.value = event.value;
		if(newVal.name == "Type")
			console.log("xd");
			// this.distNode.curve = this.makeDistortionCurve(newVal.value);
		else if(newVal.name == "Level")
			this.volumeNode.gain.value = .01 * newVal.value;
	}
}