import { Component, ViewChild, ElementRef } from '@angular/core';
import { AudioContextService } from '../audiocontext.service';
import { Pedal } from './pedal';

@Component({
  selector: 'Distortion-pedal',
  templateUrl: './distortion.pedal.html'
})

export class DistortionPedal extends Pedal{
	audioContext:AudioContext;
	//audioSource:MediaStreamAudioSourceNode;
	distNode:WaveShaperNode;
	volumeNode:GainNode;

	//Adjustable values for this pedal
	//The names of these values should be pushed to nodeData
	//	for proper display in the template and updating from template
	Dist = 50;
	Level = 50;

	constructor(protected audioContextService: AudioContextService){
		super(audioContextService);
		this.audioContext = this.audioContextService.getAudioContext();
		//Create internal nodes for this pedal:
		//Distortion, gain, and tone
		this.pedalName = "Distortion";
		this.distNode = this.audioContext.createWaveShaper();
		this.volumeNode = this.audioContext.createGain();
		this.internalNodes.push(this.distNode);
		this.internalNodes.push(this.distNode.connect(this.volumeNode));
		//Distortion parameters
		this.nodeData.push({name: "Dist", min: 1, max: 100});
		this.distNode.curve = this.makeDistortionCurve(this.Dist);
		this.distNode.oversample = '4x';
		//Level parameters
		this.nodeData.push({name: "Level", min: 1, max: 100});
		for (var node of this.nodeData) {node.default = node.max/2;}
		this.volumeNode.gain.value = .01 * this.Level;
		this.input = this.internalNodes[0];
		this.output = this.internalNodes[this.internalNodes.length-1];
	}

	makeDistortionCurve(amount) {
		var curve = new Float32Array(48000);
		var x;
		//convert 0-100 distortion range to a 0-.99 range
		var a = .5*Math.log10(amount)-.01;
		var k = 2*a/(1-a);

		for(var i = 0 ; i < 48000 ; ++i) {
			x = i*2/48000-1;
			curve[i] = (1+k) * (x) / (1+k*Math.abs(x));
		}
	  return curve;
	}

	updateValues(event: any, index: number): void {
		console.log("HELPDIST");
		this[this.nodeData[index]] = event.value;
		this.distNode.curve = this.makeDistortionCurve(this.Dist);
		this.volumeNode.gain.value = .01 * this.Level;
	}
}