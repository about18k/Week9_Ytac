import { clamp, distanceFromSpeed, fuelUsedFor, projectedRange, round } from './composition.js';

export function createVehicle(type, name, bus){
  const presets = {
    car:         { fuelCapacity: 50, efficiency: 15, maxSpeed: 180, accelStep: 10, decelStep: 12 },
    motorcycle:  { fuelCapacity: 12, efficiency: 35, maxSpeed: 140, accelStep: 12, decelStep: 16 },
    suv:         { fuelCapacity: 70, efficiency: 10, maxSpeed: 170, accelStep: 9,  decelStep: 10 },
  };
  const base = presets[type] ?? presets.car;

  const state = {
    type, name,
    engineOn: false,
    lightsOn: false,
    speed: 0,           
    odometer: 0,        
    fuel: base.fuelCapacity * 0.6,
    fuelCapacity: base.fuelCapacity,
    efficiency: base.efficiency,  
    maxSpeed: base.maxSpeed,
    accelStep: base.accelStep,
    decelStep: base.decelStep,
  };

  function emitUpdate(note){
    bus?.emit('vehicle:update', {
      ...state,
      range: projectedRange(state.fuel, state.efficiency),
      note
    });
  }

  function toggleEngine(){
    if (state.engineOn){
      state.engineOn = false;
      state.speed = 0;
      bus?.emit('vehicle:engine', { on:false });
    } else {
      if (state.fuel <= 0) return bus?.emit('toast', 'Cannot start: tank is empty.');
      state.engineOn = true;
      bus?.emit('vehicle:engine', { on:true });
    }
    emitUpdate('engine toggled');
  }

  function toggleLights(){
    state.lightsOn = !state.lightsOn;
    bus?.emit('vehicle:lights', { on: state.lightsOn });
    emitUpdate('lights toggled');
  }

  function refuel(amount = 10){
    const before = state.fuel;
    state.fuel = clamp(state.fuel + amount, 0, state.fuelCapacity);
    const added = round(state.fuel - before, 1);
    bus?.emit('toast', `Refueled +${added}L`);
    emitUpdate('refueled');
  }

  function accelerate(){
    if (!state.engineOn) return bus?.emit('toast', 'Engine is OFF.');
    if (state.fuel <= 0)  return bus?.emit('toast', 'No fuel.');
    state.speed = clamp(state.speed + state.accelStep, 0, state.maxSpeed);
    emitUpdate('accelerate');
  }

  function brake(){
    state.speed = clamp(state.speed - state.decelStep, 0, state.maxSpeed);
    emitUpdate('brake');
  }

  function tick(dtSec){
    if (state.engineOn && state.speed > 0) {
      const distance = distanceFromSpeed(state.speed, dtSec); 
      state.odometer = round(state.odometer + distance, 2);

      const eff = Math.max(5, state.efficiency - (state.speed / 200) * state.efficiency * 0.25);
      const used = fuelUsedFor(distance, eff);
      state.fuel = clamp(round(state.fuel - used, 3), 0, state.fuelCapacity);

      // gentle drag
      if (state.speed > 0) state.speed = Math.max(0, state.speed - 0.5);
      if (state.fuel === 0){
        state.engineOn = false;
        state.speed = 0;
        bus?.emit('toast', 'Fuel empty. Engine stopped.');
        bus?.emit('vehicle:engine', { on:false });
      }
      emitUpdate('tick');
    }
  }

  function snapshot(){
    return { ...state, range: projectedRange(state.fuel, state.efficiency) };
  }

  emitUpdate('created');
  return { toggleEngine, toggleLights, accelerate, brake, refuel, tick, snapshot };
}
