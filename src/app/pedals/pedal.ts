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
	nodeData;
	pedalName: string;

	constructor(protected audioContextService: AudioContextService){
		this.internalNodes = [];
		this.nodeData = [];
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

	power(): void {
		this.powerToggle = !this.powerToggle;
		let pedalArr = this.audioContextService.pedalArr;
		//Index of current pedal
		let index = pedalArr.indexOf(this);
		//Preceding and succeeding nodes/pedals
		let i = index;
		let prevNode;
		let nextNode;
		while(i>0){
			i--;
			if(pedalArr[i].powerToggle){
				prevNode = pedalArr[i];
				break;
			}
			else if (pedalArr[i] instanceof AudioNode){
				prevNode = pedalArr[i];
				break;
			}
		}
		if(i==0) prevNode = pedalArr[0];
		i = index;
		while(i<pedalArr.length){
			i++;
			if(pedalArr[i].powerToggle){
				nextNode = pedalArr[i];
				break;
			}
			else if (pedalArr[i] instanceof AudioNode){
				nextNode = pedalArr[i];
				break;
			}
		}
		if(i==pedalArr.length) nextNode = pedalArr[pedalArr.length-1];
		//Determine if prev/next nodes are nodes or pedals.
		//If pedals, reference output of prev and input of next
		if(nextNode instanceof Pedal)
			nextNode = nextNode.input;
		if(prevNode instanceof Pedal)
			prevNode = prevNode.output;
		//If power is true, turn on the pedal, else turn it off.
		//This is done by simply bypassing the pedal in the chain.
		if(this.powerToggle) {
			//use connect(pedal.input) for everything.
			prevNode.connect(this.input);
			prevNode.disconnect(nextNode);
			this.connect(nextNode);
		} else {
			prevNode.disconnect(this.input);
			prevNode.connect(nextNode);
			this.disconnect(nextNode);
		}
	}
}