import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { AudioContextService } from '../audiocontext.service';
import * as io from 'socket.io-client';
// import '@types/webaudioapi';

@Component({
  selector: 'chat',
  templateUrl: './chat.component.html'
})

export class ChatComponent implements AfterViewInit {
	audioContext:AudioContext;
	localStream;
	streamDest:MediaStreamAudioDestinationNode;
	name: string; 
	connectedUser;
	yourConn; 
	stream;
	conn;
	pcConfig = {
  	'iceServers': [{
    'urls': 'stun:stun.l.google.com:19302'
  	}]
	};
	sdpConstraints = {
	  offerToReceiveAudio: true,
	  offerToReceiveVideo: false
	};

	socket = io.connect();

	constructor(protected audioContextService: AudioContextService){}

	@ViewChild("output") output: ElementRef;
	
	ngAfterViewInit(): void {
		this.audioContext = this.audioContextService.getAudioContext();

		this.streamDest = this.audioContextService.streamDest;
		this.localStream = this.streamDest.stream;
		console.log("Got local audio stream");
	}
 
 	start() {
	//connecting to our signaling server 
	this.conn = new WebSocket('ws://localhost:9090');
	 
	this.conn.onopen = function () { 
	   console.log("Connected to the signaling server"); 
	};
	 
	//when we got a message from a signaling server 
	this.conn.onmessage = function (msg) { 
	   console.log("Got message", msg.data); 
	   var data = JSON.parse(msg.data); 
		
	   switch(data.type) { 
	      case "login": 
	         this.handleLogin(data.success); 
	         break; 
	      //when somebody wants to call us 
	      case "offer": 
	         this.handleOffer(data.offer, data.name); 
	         break; 
	      case "answer": 
	         this.handleAnswer(data.answer); 
	         break; 
	      //when a remote peer sends an ice candidate to us 
	      case "candidate": 
	         this.handleCandidate(data.candidate); 
	         break; 
	      case "leave": 
	         this.handleLeave(); 
	         break; 
	      default: 
	         break; 
	   } 
	}; 

		this.conn.onerror = function (err) { 
		   console.log("Got error", err); 
		};
	}
	 
	//alias for sending JSON encoded messages 
	send(message) { 
	   //attach the other peer username to our messages 
	   if (this.connectedUser) { 
	      message.name = this.connectedUser; 
	   } 
		
	   this.conn.send(JSON.stringify(message)); 
	};
	 
	//****** 
	//UI selectors block 
	//****** 

	// var loginPage = document.querySelector('#loginPage'); 
	// var usernameInput = document.querySelector('#usernameInput'); 
	// var loginBtn = document.querySelector('#loginBtn');

	// var callPage = document.querySelector('#callPage'); 
	// var callToUsernameInput = document.querySelector('#callToUsernameInput');
	// var callBtn = document.querySelector('#callBtn'); 

	// var hangUpBtn = document.querySelector('#hangUpBtn'); 
	// var localAudio = document.querySelector('#localAudio'); 
	// var remoteAudio = document.querySelector('#remoteAudio'); 


	// callPage.style.display = "none";
	 
	// Login when the user clicks the button 
	login() { 
	   this.name = "user"; 
		
	   if (this.name.length > 0) { 
	      this.send({ 
	         type: "login", 
	         name: name 
	      }); 
	   } 
		
	};
	 
	handleLogin(success) { 
	   if (success === false) { 
	      alert("Ooops...try a different username"); 
	   } else { 
	      // loginPage.style.display = "none"; 
	      // callPage.style.display = "block"; 
			
	      //********************** 
	      //Starting a peer connection 
	      //********************** 
			
	      //getting local audio stream 
        this.stream = this.streamDest.stream; 
		
        //using Google public stun server 
        var configuration = { 
           "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }] 
        }; 
		
        this.yourConn = new webkitRTCPeerConnection(configuration); 
		
        // setup stream listening 
        this.yourConn.addStream(this.stream); 
		
        //when a remote user adds stream to the peer connection, we display it 
        this.yourConn.onaddstream = incStream => { 
           // remoteAudio.src = window.URL.createObjectURL(e.stream);
           this.incStreamNode = this.audioContext
           	.createMediaStreamSource(incStream.stream);

           //create source
        }; 
		
        // Setup ice handling 
        this.yourConn.onicecandidate = event => { 
           if (event.candidate) { 
              this.send({ 
                 type: "candidate", 
                 candidate: event.candidate 
              }); 
           } 
        }; 
	   } 
	};
	 
	//initiating a call 
	call() { 
	   var callToUsername = callToUsernameInput.value; 
		
	   if (callToUsername.length > 0) { 
	      connectedUser = callToUsername; 
			
	      // create an offer 
	      yourConn.createOffer(function (offer) { 
	         send({
	            type: "offer", 
	            offer: offer 
	         }); 
				
	         yourConn.setLocalDescription(offer); 
	      }, function (error) { 
	         alert("Error when creating an offer"); 
	      }); 
	   } 
	};
	 
	//when somebody sends us an offer 
	handleOffer(offer, name) { 
	   this.connectedUser = name; 
	   this.yourConn.setRemoteDescription(new RTCSessionDescription(offer)); 
		
	   //create an answer to an offer 
	   this.yourConn.createAnswer(function (answer) { 
	      this.yourConn.setLocalDescription(answer); 
			
	      this.send({ 
	         type: "answer", 
	         answer: answer 
	      });
			
	   }, function (error) { 
	      alert("Error when creating an answer"); 
	   }); 
		
	};
	 
	//when we got an answer from a remote user 
	handleAnswer(answer) { 
	   this.yourConn.setRemoteDescription(new RTCSessionDescription(answer)); 
	};
	 
	//when we got an ice candidate from a remote user 
	handleCandidate(candidate) { 
	   this.yourConn.addIceCandidate(new RTCIceCandidate(candidate)); 
	};
	 
	//hang up
	hangup() { 
	   this.send({ 
	      type: "leave" 
	   }); 
		
	   this.handleLeave(); 
	};
	 
	handleLeave() { 
	   this.connectedUser = null; 
		
	   this.yourConn.close(); 
	   this.yourConn.onicecandidate = null; 
	   this.yourConn.onaddstream = null; 
	};

}