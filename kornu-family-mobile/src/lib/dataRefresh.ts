type RefreshListener = () => void;

const listeners = new Set<RefreshListener>();

export function subscribeToDataRefresh(
  listener: RefreshListener
) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function notifyDataRefresh() {
  listeners.forEach((listener) => {
    listener();
  });
}