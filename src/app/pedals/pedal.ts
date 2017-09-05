import { AudioContextService } from '../audiocontext.service';

export abstract class Pedal {
	//Input - points to preceding node in the chain
	input: AudioNode;
	//Output - points to next node in the chain
	output: AudioNode;
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

	//ConnectNode - connect this pedal to the next node in the chain
	connectNode(node: AudioNode): void {
		if(this.internalNodes.length>0) {
			this.internalNodes[this.internalNodes.length-1].connect(node);
		}
	}

	//ConnectPedal - connect this pedal to the next pedal in the chain
	connectPedal(pedal: Pedal): void {
		if(this.internalNodes.length>0) {
			pedal.input = this.internalNodes[this.internalNodes.length-1];
			this.internalNodes[this.internalNodes.length-1].connect(pedal.internalNodes[0]);
		}
	}

	//Disconnect - disconnect this pedal from its input and output nodes
	disconnect(): void {
		this.input.disconnect(this.internalNodes[0]);
		this.output.disconnect(this.internalNodes[this.internalNodes.length-1])
		this.input.connect(this.output);
		this.input = null;
	}

	bypass(): void {
		if(this.bypassToggle) {
			this.input.disconnect(this.internalNodes[0]);
			this.input.connect(this.output);
		} else {
			this.input.disconnect(this.output);
			this.input.connect(this.internalNodes[0]); 
		}
	}

	setInputNode(node: AudioNode): void {
		this.input = node;
		node.connect(this.internalNodes[0]);
	}
}