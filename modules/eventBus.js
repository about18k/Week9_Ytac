
export class EventBus {
  constructor(){ this.events = Object.create(null); }
  on(event, listener){
    (this.events[event] ||= new Set()).add(listener);
    return () => this.off(event, listener);
  }
  off(event, listener){
    if (this.events[event]) this.events[event].delete(listener);
  }
  emit(event, payload){
    if (!this.events[event]) return;
    for (const fn of this.events[event]) fn(payload);
  }
}
