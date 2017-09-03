import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { AudioContextService } from '../audiocontext.service';

let WIDTH = 600;
let HEIGHT = 200;

@Component({
  selector: 'test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})


export class TestComponent implements AfterViewInit{
	audioContext:AudioContext;
	audioSource:MediaStreamAudioSourceNode;
	analyser:AnalyserNode;
	distortion:WaveShaperNode;
	gain:GainNode;
	reverb:ConvolverNode;
	bufferLength;
	dataArray:Float32Array;
	volume = 50;
	distVal = 50;
	reverbVal = 50;

	constructor(private audioContextService: AudioContextService){}

	@ViewChild("visCanvas") canvas: ElementRef;
	canvasCtx: CanvasRenderingContext2D;

	ngAfterViewInit() {
		this.canvasCtx = this.canvas.nativeElement.getContext("2d");
		this.audioContextService.init().then(mediaStream => {
			this.audioContext = this.audioContextService.getAudioContext();
			this.audioSource = this.audioContext.createMediaStreamSource(mediaStream);
			this.audioContextService.setAudioSource(this.audioSource);
			this.audioContext = this.audioContextService.getAudioContext();
			this.audioSource = this.audioContextService.getAudioSource();
			this.analyser = this.audioContext.createAnalyser();
			this.distortion = this.audioContext.createWaveShaper();
			this.distortion.curve = this.makeDistortionCurve(this.distVal);
			this.distortion.oversample = '2x';
			this.reverb = this.audioContext.createConvolver();
			this.gain = this.audioContext.createGain();
			this.gain.gain.value = .01 * this.volume;
			//this.analyser.fftSize = 2048;
			this.dataArray = new Float32Array(this.analyser.fftSize);
			WIDTH = this.dataArray.length / 2;
		});
		//this.canvas.nativeElement.width = WIDTH;
	}

	makeDistortionCurve(amount) {
		var k = typeof amount === 'number' ? amount : 50,
    n_samples = 48000,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
	  for ( ; i < n_samples; ++i ) {
	    x = i * 2 / n_samples - 1;
	    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) )+.1;
	  }
	  return curve;
	}

	startMonitoring() {
	    		this.audioSource.connect(this.distortion);
	    		this.distortion.connect(this.gain);
	    		this.gain.connect(this.analyser);
	    		//this.reverb.connect(this.analyser);
	    		this.analyser.connect(this.audioContext.destination);
	    		this.analyser.getFloatTimeDomainData(this.dataArray);
	    		this.visualize(this);
	}
	stopMonitoring() {
	    this.audioSource.disconnect(); 
	    this.audioSource = null; 
	}
	//pass in this as tc so that it can be accessed inside draw()
	visualize(tc:TestComponent) {
		this.canvasCtx.clearRect(0,0,WIDTH,HEIGHT);
		function draw() {
			requestAnimationFrame(draw);
			tc.analyser.getFloatTimeDomainData(tc.dataArray);
			tc.canvasCtx.fillStyle = 'rgb(200,200,200)';
			tc.canvasCtx.fillRect(0,0,WIDTH,HEIGHT);
			tc.canvasCtx.lineWidth = 1;
			tc.canvasCtx.strokeStyle = 'rgb(0,0,0)';
			tc.canvasCtx.beginPath();
			for (let i = 0; i < tc.dataArray.length; i++) {
		    const x = i
		    const y = (0.5 + tc.dataArray[i] / 2) * HEIGHT;
		    if (i == 0) {
		      tc.canvasCtx.moveTo(x, y)
		    } else {
		      tc.canvasCtx.lineTo(x, y)
		    }
		  }
		  tc.canvasCtx.stroke()
		};
		draw();
	}
	updateVolume(event: any) {
		this.volume = event.value;
		this.gain.gain.value = .01 * this.volume;
	}
	updateDistortion(event: any) {
		this.distVal = event.value;
		this.distortion.curve = this.makeDistortionCurve(this.distVal);
	}
	// updateReverb(event: any) {
	// 	this.reverbVal = event.value;
	// 	this.reverb.
	// }
	// impulseResponse( duration, decay, reverse ) {
 //    var sampleRate = this.audioContext.sampleRate;
 //    var length = sampleRate * duration;
 //    var impulse = this.audioContext.createBuffer(2, length, sampleRate);
 //    var impulseL = impulse.getChannelData(0);
 //    var impulseR = impulse.getChannelData(1);

 //    if (!decay)
 //        decay = 2.0;
 //    for (var i = 0; i < length; i++){
 //      var n = reverse ? length - i : i;
 //      impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
 //      impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
 //    }
 //    return impulse;
	// }
}