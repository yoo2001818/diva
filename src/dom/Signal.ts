type Listener<T extends any[]> = (...params: T) => void;

export class Signal<T extends any[]> {
  listeners: Set<Listener<T>> = new Set();
  add(listener: Listener<T>): void {
    this.listeners.add(listener);
  }
  delete(listener: Listener<T>): void {
    this.listeners.delete(listener);
  }
  emit(...params: T): void {
    this.listeners.forEach((listener) => listener(...params));
  }
}

export class RecursiveSignal<T extends any[]> extends Signal<T> {
  registered: boolean = false;
  _recursiveListener: Listener<T> = (...args: T) => {
    this.emit(...args);
  };
  _registerFn: (listener: Listener<T>) => () => void;
  _unregisterFn: (() => void) | null = null;
  constructor(registerFn: (listener: Listener<T>) => () => void) {
    super();
    this._registerFn = registerFn;
  }
  _register(): void {
    if (this.registered) return;
    this.registered = true;
    this._unregisterFn = this._registerFn(this._recursiveListener);
  }
  _unregister(): void {
    if (!this.registered) return;
    this.registered = false;
    if (this._unregisterFn != null) {
      this._unregisterFn();
      this._unregisterFn = null;
    }
  }
  add(listener: Listener<T>): void {
    super.add(listener);
    this._register();
  }
  delete(listener: Listener<T>): void {
    super.delete(listener);
    if (this.listeners.size === 0) {
      this._unregister();
    }
  }
}
