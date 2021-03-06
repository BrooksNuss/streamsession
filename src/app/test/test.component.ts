import { Component, AfterViewInit, ViewChild, ElementRef, OnInit } from '@angular/core';
import { AudioContextService } from '../audiocontext.service';
import { HttpClient } from '@angular/common/http';
import { Pedal } from '../pedals/pedal';
import { DistortionPedal } from '../pedals/distortion.pedal';
import { ReverbPedal } from '../pedals/reverb.pedal';

@Component({
  selector: 'test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})


export class TestComponent implements AfterViewInit, OnInit{
	audioContext:AudioContext;
	audioSource:MediaStreamAudioSourceNode;
	analyser:AnalyserNode;
	distortion:DistortionPedal;
	reverb:ReverbPedal;
	// gain:GainNode;
	// filter:BiquadFilterNode;
	// reverb:ConvolverNode;
	bufferLength;
	dataArray:Float32Array;
	volume = 50;
	distVal = 50;
	reverbVal = 50;
	animateSwitch;
	isAnimating = false;
	canvasElem;
	pedalArr;

	constructor(private audioContextService: AudioContextService,
				private http: HttpClient){}

	@ViewChild("visCanvas") canvas: ElementRef;
	canvasCtx: CanvasRenderingContext2D;

	ngOnInit() {
		//create a factory for handling pedal creation. This way,
		//we don't have to pass in the service to each pedal.
		//Similar to how audiocontext.createX works.
		//this.distortion = new DistortionPedal(this.audioContextService);
		// this.reverb = new ReverbPedal(this.audioContextService);
		// this.analyser = this.audioContext.createAnalyser();
		// this.audioContextService.addPedal(this.distortion);
		// this.audioContextService.addPedal(this.reverb);
		// this.audioSource.connect(this.distortion.input);
		// this.distortion.connect(this.reverb);
		// this.reverb.connect(this.analyser);
		// this.analyser.connect(this.audioContext.destination);
		this.pedalArr = this.audioContextService.pedalArr
			.filter(node => node instanceof Pedal);
	}

	ngAfterViewInit() {
		this.canvasCtx = this.canvas.nativeElement.getContext("2d");
		this.canvasElem = this.canvas.nativeElement;
		this.canvasElem.width*=2;
		this.canvasElem.height*=2;
		this.audioContext = this.audioContextService.getAudioContext();
		this.audioSource = this.audioContextService.getAudioSource();
		this.audioContextService.addNode(this.audioContext.destination);
		this.analyser = this.audioContextService.pedalArr[
			this.audioContextService.pedalArr.length - 2];
		// this.distortion = this.audioContext.createWaveShaper();
		// this.filter = this.audioContext.createBiquadFilter();
		// this.gain = this.audioContext.createGain();
		// this.reverb = this.audioContext.createConvolver();
		//compressor, distortion, eq/filter, pitch, modulation, volume, reverb
		//distortion
		//this.distortion.curve = this.makeDistortionCurve(this.distVal);

		//filter
		/*
		this.filter.type = "lowpass"
		this.filter.frequency.value = 2000;
		//gain
		this.filter.connect(this.gain);
		this.gain.gain.value = .01 * this.volume;
		//reverb
		this.gain.connect(this.reverb);
		var source = this.audioContext.createBufferSource();
		this.http.get('/assets/impulses/GuitarHack JJ EDGE-1.wav',
			{responseType: 'arraybuffer'}).subscribe(data => {
				this.audioContext.decodeAudioData(data).then((buffer) => {
					this.reverb.buffer = buffer;
				})
			});
		*/
		//analyser
		//this.reverb.connect(this.audioContext.destination);
		// this.analyser.fftSize = 2048;
		this.dataArray = new Float32Array(this.analyser.fftSize);
		//WIDTH = this.dataArray.length*2 ;/// 2;
	}

	startMonitoring() {
		if(!this.isAnimating){
			this.visualize(this);
			this.isAnimating = !this.isAnimating;
		}
	}
	stopMonitoring() {
		if(this.isAnimating){
		  cancelAnimationFrame(this.animateSwitch);
			this.isAnimating = !this.isAnimating;
		}
	}
	//pass in this as tc so that it can be accessed inside draw()
	visualize(tc:TestComponent) {
		var WIDTH = this.canvasElem.width;
		var HEIGHT = this.canvasElem.height;
		this.canvasCtx.clearRect(0,0,WIDTH,HEIGHT);

		function draw() {
			tc.animateSwitch = requestAnimationFrame(draw);
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