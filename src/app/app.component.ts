import { Component, OnInit } from '@angular/core';
import { AudioContextService } from './audiocontext.service';
import { Pedal } from './pedals/pedal';
import { DistortionPedal } from './pedals/distortion.pedal';
import { ReverbPedal } from './pedals/reverb.pedal';

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
      var reverb = new ReverbPedal(this.audioContextService);
      var analyser = this.audioContext.createAnalyser();
      var distortion = new DistortionPedal(this.audioContextService);
      this.audioContextService.addPedal(distortion);
      this.audioContextService.addPedal(reverb);
      this.audioSource.connect(distortion.input);
      distortion.connect(reverb);
      reverb.connect(analyser);
      analyser.connect(this.audioContext.destination);
      this.audioContextService.streamDest = analyser
        .connect(this.audioContext.createMediaStreamDestination());
			this.audioInitCheck = true;
  	});
  }
}
