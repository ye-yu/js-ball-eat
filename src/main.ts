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
let ballsOnTheGround = new Array<HTMLElement>();

function newBall() {
  const ballEntity = instantiateTemplate("BALL");
  boundaryElement.appendChild(ballEntity.element);
  let topPosition = 5 * Math.random() + 5;
  const gravity = 0.01;
  const energyMaintained = 0.8;
  let gravitySpeed = 0.5 + Math.random() * 0.5;
  ballEntity.element.style.top = `${topPosition}%`;
  ballEntity.element.style.left = `${96 * Math.random()}%`;

  function isBallTouchingGround(ballElement: HTMLElement) {
    var parentRect = boundaryElement.getBoundingClientRect();
    var childRect = ballElement.getBoundingClientRect();

    // Check if any of the four corners of the inner element is outside of the outer element
    return childRect.bottom > parentRect.bottom;
  }

  const renderBall: RenderFunction = (timeDelta) => {
    const gravityDelta = timeDelta * gravity;
    gravitySpeed += gravityDelta;
    if (isBallTouchingGround(ballEntity.element) && gravitySpeed > 0) {
      console.log("gravitySpeed", gravitySpeed);
      if (gravitySpeed < 0.2) {
        ballEntity.element.style.top = `96%`;
        removeFromRender(renderId);
        ballsOnTheGround.push(ballEntity.element);
        return;
      }

      gravitySpeed -= gravityDelta;
      gravitySpeed = -(gravitySpeed * energyMaintained);
      if (Math.random() < 0.1) {
        newBall();
        if (ballsOnTheGround.length > 200) {
          for (let index = 0; index < 100; index++) {
            const element = ballsOnTheGround[index];
            boundaryElement.removeChild(element);
          }
        }
        ballsOnTheGround = ballsOnTheGround.slice(100);
      }
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
