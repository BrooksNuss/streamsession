import { AudioContextService } from '../audiocontext.service';

export abstract class Pedal {
	//powerToggle - turns the pedal's effects on or off
	//When off, the pedal's input is routed directly to the next
	//	pedal, effectively bypassing this pedal
	powerToggle = true;
	//InternalNodes - array of nodes that this pedal consists of
	internalNodes: AudioNode[];
	input: AudioNode;
	output: AudioNode;
	nodeNames: string[];
	pedalName: string;

	constructor(protected audioContextService: AudioContextService){
		this.internalNodes = [];
		this.nodeNames = [];
	}

	//Connect - connect this pedal to a node or pedal
	connect(nodeOrPedal: any): AudioNode {
		if(nodeOrPedal instanceof AudioNode) {
			if(this.internalNodes.length>0) {
				this.output.connect(nodeOrPedal);
				this.audioContextService.addNode(nodeOrPedal);
			}
		}
		else if(nodeOrPedal instanceof Pedal) {
			if(this.internalNodes.length>0) {
				this.output.connect(nodeOrPedal.internalNodes[0]);
				// this.audioContextService.addPedal(nodeOrPedal);
			}
		}
		return nodeOrPedal;
	}

	//Disconnect - disconnect this pedal from its input and output nodes
	disconnect(destination?: AudioNode, output?: number, input?: number): void {
		this.output.disconnect(destination, output, input);
	}

	//Toggle pedal power state.
	power(): void {
		this.audioContextService.powerToggle(this, !this.powerToggle);
		this.powerToggle = !this.powerToggle;
	}
}