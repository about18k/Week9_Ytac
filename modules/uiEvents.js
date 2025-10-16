export function registerUIEvents(bus){
  document.getElementById('btnEngine').addEventListener('click', () => {
    bus.emit('ui:engine:toggle');
  });
  document.getElementById('btnAccel').addEventListener('click', () => {
    bus.emit('ui:speed:accelerate');
  });
  document.getElementById('btnBrake').addEventListener('click', () => {
    bus.emit('ui:speed:brake');
  });
  document.getElementById('btnLights').addEventListener('click', () => {
    bus.emit('ui:lights:toggle');
  });
  document.getElementById('btnRefuel').addEventListener('click', () => {
    bus.emit('ui:fuel:refuel', 10);
  });
  document.getElementById('vehicleSelect').addEventListener('change', (e) => {
    bus.emit('ui:vehicle:change', e.target.value);
  });
}
