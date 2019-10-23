/**
 * The History object is an object containing a state mutation 
 */
export class HistoryObject {
  constructor(timestamp, mutationName, payload, state) {
    const date = new Date(timestamp);
    this.timestamp = date.toLocaleTimeString(undefined, { timeStyle: 'medium' });
    this.mutationName = mutationName;
    this.payload = payload;
    this.state = state;
  }
}

