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
		this.socket.on('join', message => {
			console.log("received join");
			//create peer connection.
			//add listeners.
			var pc:RTCPeerConnection;
			pc = this.createPeerConnection(message);
			// pc.addStream(this.localStream);
			this.createOffer(pc, message);
		})

		this.socket.on('offer', message => {
			console.log("received offer");
			var pc:RTCPeerConnection;
			//If we already have a connection with this user, retreive it.
			//Otherwise, create a new one
			if(this.connections.findIndex(conn => conn.id == message.socket) != -1){
				pc = this.connections[this.connections.findIndex(
					conn => conn.id == message.from)].peerConn;
			} else {
				pc = this.createPeerConnection(message);
			}
			pc.setRemoteDescription(new RTCSessionDescription(message.message));
			this.createAnswer(pc, message);
		})

		this.socket.on('answer', message => {
			console.log("received answer");
			var pc:RTCPeerConnection;
			pc = this.connections[this.connections.findIndex(
				conn => conn.id == message.from)].peerConn;
			pc.setRemoteDescription(new RTCSessionDescription(message.message));
		})

		this.socket.on('candidate', message => {
			console.log("received candidate");
			var pc:RTCPeerConnection;
			pc = this.connections[this.connections.findIndex(
				conn => conn.id == message.from)].peerConn;
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
				conn => conn.id == message.from)].peerConn;
			pc.close();
			pc = null;
		})
	}
		
	//alias for sending JSON encoded messages  
	sendMessage(type, message) {
	  // console.log('Client sending message: ', message);
	  this.socket.emit(type, message);
	}

	createPeerConnection(socket) {
		var pc:RTCPeerConnection;
		var localThis = this;
		try {
			this.numConnections++;
			pc = new RTCPeerConnection(this.pcConfig);
			pc.onicecandidate = handleIceCandidate;
			pc.onaddstream = handleRemoteStreamAdded;
			pc.onremovestream = handleRemoteStreamRemoved;
			this.connections.splice(this.numConnections, 0, {
				id: socket.from,
				peerConn: pc
			})
			pc.addStream(this.localStream);
			console.log("Created RTCPeerConnection");
			return pc;
		} catch(e) {
			console.log("Failed to createRTCPC", e.message);
		}

		function handleIceCandidate(event) {
			// console.log("icecandidate event", event);
			if(event.candidate) {
				localThis.sendMessage('candidate', {
					label: event.candidate.sdpMLineIndex,
					id: event.candidate.sdpMid,
					candidate: event.candidate.candidate,
					socket: socket.from,
					from: localThis.socket.id
				});
				// console.log("sending candidate to "+socket);
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

	createOffer(pc: RTCPeerConnection, message) {
		// pc = this.connections.findIndex(conn => conn.name == socket.id );
		console.log("attempting to create offer to "+message.from);

		var localThis = this;
		pc.createOffer().then(setLocalAndSendMessage);

		function setLocalAndSendMessage(sessionDescription) {
			pc.setLocalDescription(sessionDescription);
			// console.log("Set local description and sending msg", sessionDescription);
			localThis.sendMessage('offer', 
				{socket: message.from, from: localThis.socket.id, message: sessionDescription});
		}
	}

	createAnswer(pc: RTCPeerConnection, message) {
		console.log("attempting to create answer to "+message.from);

		var localThis = this;
		pc.createAnswer().then(setLocalAndSendMessage);

		function setLocalAndSendMessage(sessionDescription) {
			pc.setLocalDescription(sessionDescription);
			// console.log("Set local description and sending msg", sessionDescription);
			localThis.sendMessage('answer', 
				{socket: message.from, from: localThis.socket.id, message: sessionDescription});
		}
	}
}