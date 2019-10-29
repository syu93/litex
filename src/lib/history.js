/**
 * The History object is an object containing a state mutation 
 */
export class HistoryObject {
  /**
   * 
   * @param {timestamp} timestamp The actions timestamp
   * @param {String} mutationName The mutation name
   * @param {*} payload The mutation payload
   * @param {*} state The past state before the mutation appen
   */
  constructor(timestamp, mutationName, payload, state) {
    const date = new Date(timestamp);
    this.timestamp = date.toLocaleTimeString(undefined, { timeStyle: 'medium' });
    this.mutationName = mutationName;
    this.payload = payload;
    this.state = state;
  }

  getState() {
    return this.state;
  }
}

