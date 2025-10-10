import { MutationRecord } from '../MutationRecord';
import { Node } from '../Node';
import { RecursiveSignal, Signal } from '../Signal';

export function nodeRecursiveSignalRegisterFn<T extends any[]>(
  node: Node,
  selfSignal: Signal<T> | null,
  getSignal: (node: Node) => Signal<T> | null,
) {
  return (listener: (...args: T) => void) => {
    selfSignal?.add(listener);
    node._childNodes.forEach((child) => {
      getSignal(child)?.add(listener);
    });
    const nodeListHandler = (record: MutationRecord) => {
      for (let i = 0; i < record.addedNodes.length; i += 1) {
        getSignal(record.addedNodes[i])?.add(listener);
      }
      for (let i = 0; i < record.removedNodes.length; i += 1) {
        getSignal(record.removedNodes[i])?.delete(listener);
      }
    };
    node._childListChangedSignal.add(nodeListHandler);
    return () => {
      selfSignal?.delete(listener);
      node._childNodes.forEach((child) => {
        getSignal(child)?.delete(listener);
      });
      node._childListChangedSignal.delete(nodeListHandler);
    };
  };
}

export function filterSignal<T extends any[]>(
  signal: Signal<T>,
  filter: (...args: T) => boolean,
) {
  return new RecursiveSignal((listener) => {
    const handler = (...args: T) => {
      if (filter(...args)) {
        listener(...args);
      }
    };
    signal.add(handler);
    return () => {
      signal.delete(handler);
    };
  });
}
