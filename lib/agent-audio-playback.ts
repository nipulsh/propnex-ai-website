let activeStop: (() => void) | null = null;

export function claimAgentPlayback(stop: () => void) {
  activeStop?.();
  activeStop = stop;
}

export function releaseAgentPlayback(stop: () => void) {
  if (activeStop === stop) {
    activeStop = null;
  }
}
