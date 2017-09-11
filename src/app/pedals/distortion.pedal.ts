import { Component, ViewChild, ElementRef } from '@angular/core';
import { AudioContextService } from '../audiocontext.service';
import { Pedal } from './pedal';

@Component({
  selector: 'distortion-pedal',
  templateUrl: './distortion.pedal.html',
  styleUrls: ['./distortion.pedal.css']
})

export class DistortionPedal extends Pedal{
	audioContext:AudioContext;
	//audioSource:MediaStreamAudioSourceNode;
	distNode:WaveShaperNode;
	volumeNode:GainNode;

	//Adjustable values for this pedal
	//The names of these values should be pushed to nodeNames
	//	for proper display in the template and updating from template
	Drive = 50;
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
		this.nodeNames.push("Drive");
		this.distNode.curve = this.makeDistortionCurve(this.Drive);
		this.distNode.oversample = '4x';
		//Level parameters
		this.nodeNames.push("Level");
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
		this[this.nodeNames[index]] = event.value;
		this.distNode.curve = this.makeDistortionCurve(this.Drive);
		this.volumeNode.gain.value = .01 * this.Level;
	}
}