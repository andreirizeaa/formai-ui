type EventHandler = (payload?: any) => void;

interface HandlersMap {
  [event: string]: Set<EventHandler>;
}

class SimpleEventBus {
  private handlers: HandlersMap = {};

  on(event: string, handler: EventHandler) {
    if (!this.handlers[event]) this.handlers[event] = new Set();
    this.handlers[event].add(handler);
    return () => this.off(event, handler);
  }

  off(event: string, handler: EventHandler) {
    this.handlers[event]?.delete(handler);
  }

  emit<T = any>(event: string, payload?: T) {
    const set = this.handlers[event];
    if (!set || set.size === 0) return;
    set.forEach(fn => {
      try { fn(payload); } catch {}
    });
  }
}

export const eventBus = new SimpleEventBus();

export const AppEvents = {
  LiftReady: 'lift_ready',
  LiftFailed: 'lift_failed',
} as const;

export interface LiftReadyPayload {
  liftId: string;
}

export interface LiftFailedPayload {
  error?: string;
  liftId?: string;
  assetId?: string;
}


