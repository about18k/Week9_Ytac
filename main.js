// main.js
import { EventBus } from './modules/eventBus.js';
import { createVehicle } from './modules/factory.js';
import { Dashboard } from './modules/dashboardModule.js';
import { registerUIEvents } from './modules/uiEvents.js';

const bus = new EventBus();
let vehicle = null;
let loop = null;

function startLoop(){
  stopLoop();
  loop = setInterval(() => vehicle?.tick(1), 1000); 
}
function stopLoop(){
  if (loop) clearInterval(loop);
  loop = null;
}

function buildVehicle(type='car'){
  vehicle = createVehicle(type, 'My Ride', bus);
  bus.emit('vehicle:update', vehicle.snapshot());
  startLoop();
}

function wireActions(){
  // UI → vehicle actions via events (Observer)
  bus.on('ui:engine:toggle', () => vehicle?.toggleEngine());
  bus.on('ui:speed:accelerate', () => vehicle?.accelerate());
  bus.on('ui:speed:brake', () => vehicle?.brake());
  bus.on('ui:lights:toggle', () => vehicle?.toggleLights());
  bus.on('ui:fuel:refuel', (amt) => vehicle?.refuel(amt));
  bus.on('ui:vehicle:change', (type) => {
    bus.emit('toast', `Switched to ${type}.`);
    buildVehicle(type);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  Dashboard.init(bus);
  registerUIEvents(bus);
  wireActions();
  buildVehicle('car'); 
});
