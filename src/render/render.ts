export interface RenderFunction {
  (timeDelta: number): void;
}

const renderFunctions: Record<string, RenderFunction> = {};

let lastTime: number = 0;

function renderAll() {
  const lastRecordedTime = lastTime;
  const newRecordedTime = performance.now();
  lastTime = newRecordedTime;
  const timeDelta = newRecordedTime - lastRecordedTime;
  Object.values(renderFunctions).forEach((e) => e(timeDelta));
  requestAnimationFrame(renderAll);
}

export function initialiseRenderer() {
  lastTime = performance.now();
  renderAll();
}

export function addToRender(f: RenderFunction) {
  const id = crypto.randomUUID();
  renderFunctions[id] = f;
  return id;
}

export function removeFromRender(id: string) {
  delete renderFunctions[id];
}

export function getRenderCounts() {
  return Object.values(renderFunctions).length;
}
