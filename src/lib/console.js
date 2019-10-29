import { createProxy } from './helpers.js';
import { group } from './logger.js';

function consoleTable() {
  group('log', `Show history`, () => console.table(this.history));
  return null;
}

function rewind(index) {
  if (!this.history[index]) return console.error(`[Litex][error] Trying to rewind to an undefined state n° : ${index}`);
  const historyState = this.history[index];

  const createProxyMethod = createProxy.bind(this);

  // Create a new proxy in order to maintain the sync on all mapped state elements
  this.state = createProxyMethod(historyState.getState());
  this.events.publish('stateChange', this.state);
} 

export {
  consoleTable,
  rewind
};
