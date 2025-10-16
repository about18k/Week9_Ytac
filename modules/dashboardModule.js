// modules/dashboardModule.js
import { clamp, round } from './composition.js';

function mapRange(v, inMin, inMax, outMin, outMax){
  const t = (v - inMin) / (inMax - inMin);
  return outMin + clamp(t, 0, 1) * (outMax - outMin);
}

export const Dashboard = (() => {
  let els = {};
  let unsub = [];

  function setWarn(id, on){
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('on', !!on);
  }

  function showToast(msg){
    if (!els.toast) return;
    els.toast.textContent = msg;
    els.toast.hidden = false;
    clearTimeout(els.toast._t);
    els.toast._t = setTimeout(() => (els.toast.hidden = true), 1600);
  }

  function render(state){
    const { speed, fuel, fuelCapacity, odometer, engineOn, lightsOn, maxSpeed, efficiency } = state;
    const range = fuel * efficiency;

    // center numbers
    els.odoVal.textContent = round(odometer, 1).toFixed(1);
    els.rangeVal.textContent = Math.round(range);
    els.fuelVal.textContent = round(fuel, 1).toFixed(1);

    // needles
    // dial sweep is -120° .. +120°
    const speedAngle = mapRange(speed, 0, maxSpeed, -120, 120);
    // Simple rpm model: idle 800, max 6500 mapped from speed
    const rpm = engineOn ? Math.max(800, (speed / maxSpeed) * 6500) : 0;
    const rpmAngle = mapRange(rpm, 0, 8000, -120, 120);

    const ease = v => v < 10 ? v * 0.85 : v; // damp jitter <10 km/h
    els.speedNeedle.style.setProperty('--deg', `${ease(speedAngle)}deg`);
    els.rpmNeedle.style.setProperty('--deg', `${rpmAngle}deg`);

    els.speedNeedle.style.setProperty('--deg', `${speedAngle}deg`);
    els.rpmNeedle.style.setProperty('--deg', `${rpmAngle}deg`);

    // warnings (demo logic)
    const fuelLow = (fuel / fuelCapacity) < 0.12;
    setWarn('w-fuel', fuelLow);
    setWarn('w-oil', !engineOn || fuel <= 0);
    setWarn('w-batt', !engineOn);
    setWarn('w-brake', !engineOn);   // pretend park brake engaged when engine off
    setWarn('w-abs', false);
    setWarn('w-air', false);
    setWarn('w-tc', lightsOn);       // pretend traction light uses "lights" toggle
    setWarn('w-seat', engineOn && speed > 0); // seatbelt reminder while moving
  }

  function init(bus){
    els = {
      speedNeedle: document.getElementById('speedNeedle'),
      rpmNeedle:   document.getElementById('rpmNeedle'),
      odoVal:      document.getElementById('odoVal'),
      rangeVal:    document.getElementById('rangeVal'),
      fuelVal:     document.getElementById('fuelVal'),
      toast:       document.getElementById('toast'),
    };

    unsub.push(
      bus.on('vehicle:update', render),
      bus.on('vehicle:engine', () => {}), // already handled in render()
      bus.on('vehicle:lights', () => {}),
      bus.on('toast', showToast),
    );
  }

  function destroy(){
    unsub.forEach(off => off?.());
    unsub = [];
  }

  return { init, destroy };
})();
