import { AudioContextService } from '../audiocontext.service';

export abstract class Pedal implements AudioNode {

	channelCount: number;
	channelCountMode: any;
	channelInterpretation: any;
	context: AudioContext;
	numberOfInputs: number;
	numberOfOutputs: number;
	//BypassToggle - allow this pedal to be bypassed
	//This causes the pedal's input to be routed directly to the next
	//	pedal, effectively "turning off" this pedal
	bypassToggle: boolean;
	//InternalNodes - array of nodes that this pedal consists of
	internalNodes: AudioNode[];
	nodeNames: string[];
	pedalName: string;

	constructor(protected audioContextService: AudioContextService){
		this.internalNodes = [];
		this.nodeNames = [];
	}

	addEventListener() {

	}

	removeEventListener() {

	}

	dispatchEvent(event: Event): boolean {
		return true;
	}






	//So if you disconnect one, only remove it from the list of pedals,
	//and maybe add a list of disconnected pedals in case you want to
	//reconnect it. Removes need for input/output, allows much easier
	//integration. Standardize connect function. May still have to
	//manually add the new pedal to the array in the component. Test to
	//see if effects persist when moving from test to dashboard. Also
	//check analyser for the same











	//Connect - connect this pedal to a node or pedal
	connect(nodeOrPedal: any): AudioNode {
		if(nodeOrPedal instanceof AudioNode) {
			if(this.internalNodes.length>0) {
				this.internalNodes[this.internalNodes.length-1].connect(nodeOrPedal);
				this.audioContextService.addNode(nodeOrPedal);
			}
		}
		else if(nodeOrPedal instanceof Pedal) {
			if(this.internalNodes.length>0) {
				this.internalNodes[this.internalNodes.length-1].connect(nodeOrPedal.internalNodes[0]);
				this.audioContextService.addNode(nodeOrPedal);
			}
		}
		return nodeOrPedal;
	}

	//Disconnect - disconnect this pedal from its input and output nodes
	disconnect(): void {
		// this.input.disconnect(this.internalNodes[0]);
		// this.output.disconnect(this.internalNodes[this.internalNodes.length-1])
		// this.input.connect(this.output);
		// this.input = null;
	}

	bypass(): void {
		// if(this.bypassToggle) {
		// 	this.input.disconnect(this.internalNodes[0]);
		// 	this.input.connect(this.output);
		// } else {
		// 	this.input.disconnect(this.output);
		// 	this.input.connect(this.internalNodes[0]); 
		// }
	}
}