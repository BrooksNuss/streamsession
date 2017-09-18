import { Component, OnInit } from '@angular/core';
import { AudioContextService } from './audiocontext.service';
import { Pedal } from '../pedals/pedal';
import { DistortionPedal } from '../pedals/distortion.pedal';
import { ReverbPedal } from '../pedals/reverb.pedal';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'StreamSession';
  audioContext: AudioContext;
  audioSource: MediaStreamAudioSourceNode;
  audioInitCheck = false;
  navLinks = [{route: "/dashboard", label: "Dashboard"},
   {route: "/test", label: "Test"},
   {route: "/chat", label: "Chat"}];

  constructor(private audioContextService: AudioContextService){}

  ngOnInit() {
  	this.audioContextService.init().then(mediaStream => {
			this.audioContext = this.audioContextService.getAudioContext();
			this.audioSource = this.audioContext.createMediaStreamSource(mediaStream);
			this.audioContextService.setAudioSource(this.audioSource);
      this.audioContextService.addNode(this.audioSource);
      this.reverb = new ReverbPedal(this.audioContextService);
      this.analyser = this.audioContext.createAnalyser();
      this.audioContextService.addPedal(new DistortionPedal(this.audioContextService));
      this.audioContextService.addPedal(new ReverbPedal(this.audioContextService));
      this.audioSource.connect(this.distortion.input);
      this.distortion.connect(this.reverb);
      this.reverb.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
			this.audioInitCheck = true;
  	});
  }
}
