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

  // constructor(private audioContextService: AudioContextService){}

  // ngOnInit() {
  // 	this.audioContext = new AudioContext();
  // 	navigator.mediaDevices.getUserMedia({ audio: true, video: false })
  //   	.then(mediaStream => {
  //   		this.audioSource = this.audioContext.createMediaStreamSource(mediaStream);
  //   		this.audioContextService.setAudioSource(this.audioSource);
  //   	});
  //   this.audioContextService.setAudioContext(this.audioContext);
  // }
}
