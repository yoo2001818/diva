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
