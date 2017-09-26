import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { AudioContextService } from '../audiocontext.service';
import * as io from 'socket.io-client';
// import '@types/webaudioapi';

@Component({
  selector: 'chat',
  templateUrl: './chat.component.html'
})

export class ChatComponent implements AfterViewInit, OnDestroy {
	audioContext:AudioContext;
	localStream;
	streamDest:MediaStreamAudioDestinationNode;
	name: string; 
	connectedUser;
	yourConn; 
	stream;
	conn;
	connections;
	numConnections = -1;
	pcConfig = {
  	'iceServers': [{
    'urls': 'stun:stun.l.google.com:19302'
  	}]
	};
	sdpConstraints = {
	  offerToReceiveAudio: true,
	  offerToReceiveVideo: false
	};

	constructor(protected audioContextService: AudioContextService){}

	@ViewChild("output") output: ElementRef;
	
	ngAfterViewInit(): void {
		this.audioContext = this.audioContextService.getAudioContext();

		this.streamDest = this.audioContextService.streamDest;
		this.localStream = this.streamDest.stream;
		console.log("Got local audio stream");
		this.connections = [];
		this.start();
	}

	ngOnDestroy() {
		this.sendMessage('disconnect', {socket: this.socket.id});
	}
 
	// Could prompt for room name:
	// room = prompt('Enter room name:');

	socket = io.connect();
	start() {
		this.socket.on('join', socket => {
			console.log("received join");
			//create peer connection.
			//add listeners.
			var pc:RTCPeerConnection;
			pc = this.createPeerConnection(socket);
			pc.addStream(this.localStream);
			this.createOffer(pc, socket);
		})

		this.socket.on('offer', message => {
			console.log("received offer");
			var pc:RTCPeerConnection;
			pc = this.connections[this.connections.findIndex(
				conn => conn.id == message.socket)].peerConn;
			pc.setRemoteDescription(new RTCSessionDescription(message.message));
		})

		this.socket.on('answer', message => {
			console.log("received answer");
			var pc:RTCPeerConnection;
			pc = this.connections[this.connections.findIndex(
				conn => conn.id == message.socket)].peerConn;
			pc.setRemoteDescription(new RTCSessionDescription(message.message));
		})

		this.socket.on('candidate', message => {
			console.log("received candidate");
			var pc:RTCPeerConnection;
			pc = this.connections[this.connections.findIndex(
				conn => conn.id == message.socket)].peerConn;
			var candidate = new RTCIceCandidate({
				sdpMLineIndex: message.label,
				candidate: message.candidate
			});
			pc.addIceCandidate(candidate);
		})

		this.socket.on('disconnect', message => {
			console.log("received disconnect");
			var pc:RTCPeerConnection;
			pc = this.connections[this.connections.findIndex(
				conn => conn.id == message.socket)].peerConn;
			pc.close();
			pc = null;
		})

		// this.socket.on('message', function(message) {
		//   console.log('Client received message:', message);
		//   if (message === 'got user media') {
		//     this.maybeStart();
		//   } else if (message.type === 'offer') {
		//     if (!this.isInitiator && !this.isStarted) {
		//       this.maybeStart();
		//     }
		//     this.pc.setRemoteDescription(new RTCSessionDescription(message));
		//     this.doAnswer();
		//   } else if (message.type === 'answer' && this.isStarted) {
		//     this.pc.setRemoteDescription(new RTCSessionDescription(message));
		//   } else if (message.type === 'candidate' && this.isStarted) {
		//     var candidate = new RTCIceCandidate({
		//       sdpMLineIndex: message.label,
		//       candidate: message.candidate
		//     });
		//     this.pc.addIceCandidate(candidate);
		//   } else if (message === 'bye' && this.isStarted) {
		//     this.handleRemoteHangup();
		//   }
		// });
	}
		
	//alias for sending JSON encoded messages  
	sendMessage(type, message) {
	  console.log('Client sending message: ', message);
	  this.socket.emit(type, message);
	}

	createPeerConnection(socket) {
		var pc:RTCPeerConnection;
		var localThis = this;
		try {
			this.numConnections++;
			this.connections.splice(this.numConnections, 0, {
				id: socket,
				peerConn: pc
			})
			pc = new RTCPeerConnection(null);
			pc.onicecandidate = handleIceCandidate;
			pc.onaddstream = handleRemoteStreamAdded;
			pc.onremovestream = handleRemoteStreamRemoved;
			
			console.log("Created RTCPeerConnection");
			return pc;
		} catch(e) {
			console.log("Failed to createRTCPC", e.message);
		}


		function handleIceCandidate(event) {
			console.log("icecandidate event", event);
			if(event.candidate) {
				localThis.sendMessage('candidate', {
					label: event.candidate.sdpMLineIndex,
					id: event.candidate.sdpMid,
					candidate: event.candidate.candidate,
					socket: socket
				});
				console.log("sending candidate to "+socket);
			} else {
				console.log("end of candidates");
			}
		}

		function handleRemoteStreamAdded(event) {
			var remStreamNode;
			remStreamNode = localThis.audioContext.createMediaStreamSource(event.stream);
			localThis.connections[localThis.numConnections].inStream = remStreamNode;
			remStreamNode.connect(localThis.audioContext.destination);
			console.log("remote stream added");
		}

		function handleRemoteStreamRemoved(event) {
			console.log("remote stream removed"+event);
		}
	}

	createOffer(pc: RTCPeerConnection, socket) {
		// pc = this.connections.findIndex(conn => conn.name == socket.id );
		console.log("attempting to create offer to "+socket);

		var localThis = this;
		pc.createOffer().then(setLocalAndSendMessage);

		function setLocalAndSendMessage(sessionDescription) {
			pc.setLocalDescription(sessionDescription);
			console.log("Set local description and sending msg", sessionDescription);
			localThis.sendMessage('offer', 
				{socket: socket, from: localThis.socket.id, message: sessionDescription});
		}
	}
}