import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { AudioContextService } from '../audiocontext.service';
// import '@types/webaudioapi';

@Component({
  selector: 'chat',
  templateUrl: './chat.component.html'
})

export class ChatComponent implements AfterViewInit {
	audioContext:AudioContext;
	//our username 
	name = "HEHEXD";
	connectedUser;
	yourConn; 
	stream;
	conn;
	dest;
	callInputValue;

	constructor(protected audioContextService: AudioContextService){}
		 
	@ViewChild("callInput") callInput: ElementRef;

	ngAfterViewInit(): void {
		this.audioContext = this.audioContextService.getAudioContext();
		this.conn = new WebSocket('ws://localhost:3001');
		this.conn.onopen = function () { 
		   console.log("Connected to the signaling server"); 
		};
		this.callInputValue = this.callInput.nativeElement.value;
		 
		//when we got a message from a signaling server 
		this.conn.onmessage = (msg) => { 
		   console.log("Got message", msg.data);
		   console.log("msg", msg); 
		   var data = JSON.parse(msg.data);
			
		   switch(data.type) { 
		      case "login": 
		         this.handleLogin(data.success); 
		         break; 
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
		 
	// Login when the user clicks the button 
	login() {
		this.name = "HEHEXD"; 
		
	   if (this.name.length > 0) { 
	      this.send({ 
	         type: "login", 
	         name: this.name 
	      }); 
	   } 
	}
	
	handleLogin(success){
		if (success === false) { 
	    alert("Ooops...try a different username"); 
	  } else { 
	    this.dest = this.audioContext.createMediaStreamDestination();
	    this.audioContextService
	    	.pedalArr[this.audioContextService.pedalArr.length-1].connect(this.dest);
	      this.stream = this.dest.stream; 
			
	       //using Google public stun server 
	      var configuration = { 
	         "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }] 
	      }; 
			
	      this.yourConn = new RTCPeerConnection(configuration); 
			
	      // setup stream listening 
	      this.yourConn.addStream(this.stream); 
			
	      // Setup ice handling 
	      this.yourConn.onicecandidate = function (event) { 
	          	if (event.candidate) { 
		            this.send({ 
		      	       type: "candidate", 
		          	   candidate: event.candidate 
		            }); 
	          	} 
	      	}; 
	    }	
	}
	
	call(){
		console.log(this.callInputValue);
    if (this.callInputValue.length > 0) { 
      this.connectedUser = this.callInputValue; 
	
      // create an offer 
      this.yourConn.createOffer(function (offer) { 
      	this.send({
          	type: "offer", 
          	offer: offer 
       	}); 
		
      	this.yourConn.setLocalDescription(offer); 
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
	hangUp(){
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