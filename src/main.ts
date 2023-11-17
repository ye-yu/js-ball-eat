import {
  RenderFunction,
  addToRender,
  initialiseRenderer,
  removeFromRender,
} from "./render/render";
import "./style.css";
import { initialiseTemplates, instantiateTemplate } from "./templates/manager";

initialiseRenderer();

const boundaries = document.getElementsByClassName("boundary");
if (!boundaries.length) {
  throw new Error(`<div class="boundary"> cannot be found`);
}

const boundaryElement = boundaries[0];

function newBall() {
  const ballEntity = instantiateTemplate("BALL");
  boundaryElement.appendChild(ballEntity.element);
  ballEntity.element.style.borderColor = `#${crypto.randomUUID().slice(0, 6)}`;
  let topPosition = 5 * Math.random() + 5;
  const gravity = 0.001;
  const energyMaintained = 0.8;
  let gravitySpeed = 0.5 + Math.random() * 0.5;
  ballEntity.element.style.top = `${topPosition}%`;
  ballEntity.element.style.left = `${96 * Math.random()}%`;

  function isBallTouchingGround(ballElement: HTMLElement) {
    var parentRect = boundaryElement.getBoundingClientRect();
    var childRect = ballElement.getBoundingClientRect();
    return childRect.bottom > parentRect.bottom;
  }

  const renderBall: RenderFunction = (timeDelta) => {
    const gravityDelta = timeDelta * gravity;
    gravitySpeed += gravityDelta;
    if (isBallTouchingGround(ballEntity.element) && gravitySpeed > 0) {
      if (gravitySpeed < 0.2) {
        ballEntity.element.style.top = `96%`;
        removeFromRender(renderId);
        boundaryElement.removeChild(ballEntity.element);
        return;
      }

      gravitySpeed -= gravityDelta;
      gravitySpeed = -(gravitySpeed * energyMaintained);
      newBall();
    }
    topPosition += gravitySpeed;
    ballEntity.element.style.top = `${Math.min(topPosition, 96)}%`;
  };

  const renderId = addToRender(renderBall);
}

try {
  await initialiseTemplates();
  newBall();
} catch (error) {
  console.error(error);
}
