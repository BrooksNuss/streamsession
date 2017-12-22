import { AudioContextService } from '../audiocontext.service';

export abstract class Pedal {
	//powerToggle - turns the pedal's effects on or off
	//When off, the bypassChannel volume is 100%, so the pedal's input
	//	gets routed straight to the output without going through any of the effects.
	powerToggle = true;
	//InternalNodes - array of nodes that this pedal consists of
	internalNodes: AudioNode[];
	input: GainNode;
	output: GainNode;
	bypassChannel: GainNode;
	mainChannel: GainNode;
	nodeData;
	pedalName: string;

	constructor(protected audioContextService: AudioContextService){
		this.internalNodes = [];
		this.nodeData = [];
		this.input = audioContextService.audioContext.createGain();
		this.output = audioContextService.audioContext.createGain();
		this.mainChannel = audioContextService.audioContext.createGain();
		this.bypassChannel = audioContextService.audioContext.createGain();
		this.input.gain.value = 1;
		this.output.gain.value = 1;
		this.mainChannel.gain.value = 1;
		this.bypassChannel.gain.value = 0;
		this.input.connect(this.bypassChannel);
		this.input.connect(this.mainChannel);
		this.bypassChannel.connect(this.output);
	}

	//Connect - connect this pedal to a node or pedal
	connect(node: any): AudioNode { //because node is of type any, we can pass it here and just check for pedalName
		if(node.pedalName) {
			this.output.connect(node.input);
		}
		else {
			this.output.connect(node);
			this.audioContextService.addNode(node);
		}
		return node;
	}

	//Disconnect - disconnect this pedal from its input and output nodes
	disconnect(destination?: AudioNode, output?: number, input?: number): void {
		this.output.disconnect(destination, output, input);
	}

	power(): void {
		//swap values
		this.mainChannel.gain.value = this.bypassChannel.gain.value;
		//activate/deactivate bypassChannel channel
		this.bypassChannel.gain.value = 1-this.mainChannel.gain.value;
	}
}