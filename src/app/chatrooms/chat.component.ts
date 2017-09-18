import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { AudioContextService } from '../audiocontext.service';
import * as io from 'socket.io-client';
// import '@types/webaudioapi';

@Component({
  selector: 'chat',
  templateUrl: './chat.component.html'
})

export class ChatComponent implements AfterViewInit {
	audioContext:AudioContext;
	text;
	isChannelReady = false;
	isInitiator = false;
	isStarted = false;
	localStream;
	streamDest:MediaStreamAudioDestinationNode;
	pc;
	remoteStream;
	incomingStream;
	turnReady;
	pcConfig = {
  	'iceServers': [{
    'urls': 'stun:stun.l.google.com:19302'
  	}]
	};
	sdpConstraints = {
	  offerToReceiveAudio: true,
	  offerToReceiveVideo: false
	};

	room = 'foo';
	// Could prompt for this.room name:
	// this.room = prompt('Enter this.room name:');

	socket = io.connect();

	constructor(protected audioContextService: AudioContextService){}

	updateText(value: string) {
		this.text = value;
	}

	@ViewChild("output") output: ElementRef;
	
	ngAfterViewInit(): void {
		this.audioContext = this.audioContextService.getAudioContext();

		this.streamDest = this.audioContext.createMediaStreamDestination();
		console.log(this.audioContextService.pedalArr);
		this.audioContextService.pedalArr[
			this.audioContextService.pedalArr.length - 2]
			.connect(this.streamDest);
		this.localStream = this.streamDest.stream;

		this.sendMessage("Stream ready");
		if(this.isInitiator)
			this.maybeStart();

		if (this.room !== '') {
		  this.socket.emit('create or join', this.room);
		  console.log('Attempted to create or  join room', this.room);
		}

		this.socket.on('created', function(room) {
		  console.log('Created this.room ' + room);
		 this.isInitiator = true;
		});

		this.socket.on('full', function(room) {
		  console.log('this.room ' + room + ' is full');
		});

		this.socket.on('join', function (room){
		  console.log('Another peer made a request to join room ' + room);
		  console.log('This peer is the initiator of room ' + room + '!');
		  this.isChannelReady = true;
		});

		this.socket.on('joined', function(room) {
		  console.log('joined: ' + room);
		  this.isChannelReady = true;
		});

		this.socket.on('log', function(array) {
		  console.log.apply(console, array);
		});

		this.socket.on('message', function(message) {
		  console.log('Client received message:', message);
		  if (message === 'got user media') {
		    this.maybeStart();
		  } else if (message.type === 'offer') {
		    if (!this.isInitiator && !this.isStarted) {
		      this.maybeStart();
		    }
		    this.pc.setRemoteDescription(new RTCSessionDescription(message));
		    this.doAnswer();
		  } else if (message.type === 'answer' && this.isStarted) {
		    this.pc.setRemoteDescription(new RTCSessionDescription(message));
		  } else if (message.type === 'candidate' && this.isStarted) {
		    var candidate = new RTCIceCandidate({
		      sdpMLineIndex: message.label,
		      candidate: message.candidate
		    });
		    this.pc.addIceCandidate(candidate);
		  } else if (message === 'bye' && this.isStarted) {
		    this.handleRemoteHangup();
		  }
		});
		
	}
	////////////////////////////////////////////////

	sendMessage(message) {
	  console.log('Client sending message: ', message);
	  this.socket.emit('message', message);
	}

	// This client receives a message
	

	////////////////////////////////////////////////////

	// if (location.hostname !== 'localhost') {
	//   requestTurn(
	//     'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
	//   );
	// }

	maybeStart() {
	  console.log('>>>>>>> maybeStart() ', this.isStarted, this.localStream, this.isChannelReady);
	  if (!this.isStarted && typeof this.localStream !== 'undefined' && this.isChannelReady) {
	    console.log('>>>>>> creating peer connection');
	    this.createPeerConnection();
	    this.pc.addStream(this.localStream);
	    this.isStarted = true;
	    console.log('isInitiator',this.isInitiator);
	    if (this.isInitiator) {
	      this.doCall();
	    }
	  }
	}

	// window.onbeforeunload = function() {
	//   sendMessage('bye');
	// };

	/////////////////////////////////////////////////////////

	createPeerConnection() {
	  try {
	    this.pc = new RTCPeerConnection(null);
	    this.pc.onicecandidate = this.handleIceCandidate;
	    this.pc.onaddstream = this.handleRemoteStreamAdded;
	    this.pc.onremovestream = this.handleRemoteStreamRemoved;
	    console.log('Created RTCPeerConnnection');
	  } catch (e) {
	    console.log('Failed to create PeerConnection, exception: ' + e.message);
	    alert('Cannot create RTCPeerConnection object.');
	    return;
	  }
	}

	handleIceCandidate(event) {
	  console.log('icecandidate event: ', event);
	  if (event.candidate) {
	    this.sendMessage({
	      type: 'candidate',
	      label: event.candidate.sdpMLineIndex,
	      id: event.candidate.sdpMid,
	      candidate: event.candidate.candidate
	    });
	  } else {
	    console.log('End of candidates.');
	  }
	}

	handleRemoteStreamAdded(event) {
	  console.log('Remote stream added.');
	  this.remoteStream = event.stream;
	  this.incomingStream = this.audioContext
	  	.createMediaStreamSource(this.remoteStream);
	  this.incomingStream.connect(this.audioContext.destination);
	}

	handleCreateOfferError(event) {
	  console.log('createOffer() error: ', event);
	}

	doCall() {
	  console.log('Sending offer to peer');
	  this.pc.createOffer(this.setLocalAndSendMessage, this.handleCreateOfferError);
	}

	doAnswer() {
	  console.log('Sending answer to peer.');
	  this.pc.createAnswer().then(
	    this.setLocalAndSendMessage,
	    this.onCreateSessionDescriptionError
	  );
	}

	setLocalAndSendMessage(sessionDescription) {
	  // Set Opus as the preferred codec in SDP if Opus is present.
	  //  sessionDescription.sdp = preferOpus(sessionDescription.sdp);
	  this.pc.setLocalDescription(sessionDescription);
	  console.log('setLocalAndSendMessage sending message', sessionDescription);
	  this.sendMessage(sessionDescription);
	}

	onCreateSessionDescriptionError(error) {
	  console.log('Failed to create session description: ' + error.toString());
	}

	// function requestTurn(turnURL) {
	//   var turnExists = false;
	//   for (var i in pcConfig.iceServers) {
	//     if (pcConfig.iceServers[i].url.substr(0, 5) === 'turn:') {
	//       turnExists = true;
	//       turnReady = true;
	//       break;
	//     }
	//   }
	//   if (!turnExists) {
	//     console.log('Getting TURN server from ', turnURL);
	//     // No TURN server. Get one from computeengineondemand.appspot.com:
	//     var xhr = new XMLHttpRequest();
	//     xhr.onreadystatechange = function() {
	//       if (xhr.readyState === 4 && xhr.status === 200) {
	//         var turnServer = JSON.parse(xhr.responseText);
	//         console.log('Got TURN server: ', turnServer);
	//         pcConfig.iceServers.push({
	//           'url': 'turn:' + turnServer.username + '@' + turnServer.turn,
	//           'credential': turnServer.password
	//         });
	//         turnReady = true;
	//       }
	//     };
	//     xhr.open('GET', turnURL, true);
	//     xhr.send();
	//   }
	// }

	handleRemoteStreamRemoved(event) {
	  console.log('Remote stream removed. Event: ', event);
	}

	hangup() {
	  console.log('Hanging up.');
	  stop();
	  this.sendMessage('bye');
	}

	handleRemoteHangup() {
	  console.log('Session terminated.');
	  stop();
	 this.isInitiator = false;
	}

	stop() {
	  this.isStarted = false;
	  // isAudioMuted = false;
	  // isVideoMuted = false;
	  this.pc.close();
	  this.pc = null;
	}

	///////////////////////////////////////////

	// Set Opus as the default audio codec if it's present.
	preferOpus(sdp) {
	  var sdpLines = sdp.split('\r\n');
	  var mLineIndex;
	  // Search for m line.
	  for (var i = 0; i < sdpLines.length; i++) {
	    if (sdpLines[i].search('m=audio') !== -1) {
	      mLineIndex = i;
	      break;
	    }
	  }
	  if (mLineIndex === null) {
	    return sdp;
	  }

	  // If Opus is available, set it as the default in m line.
	  for (i = 0; i < sdpLines.length; i++) {
	    if (sdpLines[i].search('opus/48000') !== -1) {
	      var opusPayload = this.extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
	      if (opusPayload) {
	        sdpLines[mLineIndex] = this.setDefaultCodec(sdpLines[mLineIndex],
	          opusPayload);
	      }
	      break;
	    }
	  }

	  // Remove CN in m line and sdp.
	  sdpLines = this.removeCN(sdpLines, mLineIndex);

	  sdp = sdpLines.join('\r\n');
	  return sdp;
	}

	extractSdp(sdpLine, pattern) {
	  var result = sdpLine.match(pattern);
	  return result && result.length === 2 ? result[1] : null;
	}

	// Set the selected codec to the first in m line.
	setDefaultCodec(mLine, payload) {
	  var elements = mLine.split(' ');
	  var newLine = [];
	  var index = 0;
	  for (var i = 0; i < elements.length; i++) {
	    if (index === 3) { // Format of media starts from the fourth.
	      newLine[index++] = payload; // Put target payload to the first.
	    }
	    if (elements[i] !== payload) {
	      newLine[index++] = elements[i];
	    }
	  }
	  return newLine.join(' ');
	}

	// Strip CN from sdp before CN constraints is ready.
	removeCN(sdpLines, mLineIndex) {
	  var mLineElements = sdpLines[mLineIndex].split(' ');
	  // Scan from end for the convenience of removing an item.
	  for (var i = sdpLines.length - 1; i >= 0; i--) {
	    var payload = this.extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
	    if (payload) {
	      var cnPos = mLineElements.indexOf(payload);
	      if (cnPos !== -1) {
	        // Remove CN payload from m line.
	        mLineElements.splice(cnPos, 1);
	      }
	      // Remove CN line in sdp
	      sdpLines.splice(i, 1);
	    }
	  }

	  sdpLines[mLineIndex] = mLineElements.join(' ');
	  return sdpLines;
	}

}