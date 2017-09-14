import { Component, OnInit } from '@angular/core';
import { AudioContextService } from './audiocontext.service';

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
   {route: "/test", label: "Test"}];

  constructor(private audioContextService: AudioContextService){}

  ngOnInit() {
  	this.audioContextService.init().then(mediaStream => {
			this.audioContext = this.audioContextService.getAudioContext();
			this.audioSource = this.audioContext.createMediaStreamSource(mediaStream);
			this.audioContextService.setAudioSource(this.audioSource);
      this.audioContextService.addNode(this.audioSource);
			this.audioInitCheck = true;
  	});
  }
}
