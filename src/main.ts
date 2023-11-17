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
let flyingBallSize = 4;
let flyingBall: HTMLElement;

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

  function isBallTouchedByFlyingBall(ballElement: HTMLElement) {
    var rect1 = ballElement.getBoundingClientRect();
    var rect2 = flyingBall.getBoundingClientRect();

    // Check for overlap
    return !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );
  }

  const renderBall: RenderFunction = (timeDelta) => {
    if (isBallTouchedByFlyingBall(ballEntity.element)) {
      removeFromRender(renderId);
      boundaryElement.removeChild(ballEntity.element);
      flyingBallSize += 0.1;
      flyingBallSize = Math.min(flyingBallSize, 90);
      flyingBall.style.width = `${flyingBallSize}%`;
      flyingBall.style.height = `${flyingBallSize}%`;
    }
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
  const ballEntity = instantiateTemplate("BALL");
  boundaryElement.appendChild(ballEntity.element);
  ballEntity.element.style.border = "none";
  ballEntity.element.style.background = `#EEE`;
  ballEntity.element.style.width = `${flyingBallSize}%`;
  ballEntity.element.style.height = `${flyingBallSize}%`;
  const speed = 0.1;
  let top = 0;
  let left = 0;
  let speedTop = speed * 0.3;
  let speedLeft = speed - speedTop;
  const updateBallPosition = () => {
    ballEntity.element.style.top = `${top}%`;
    ballEntity.element.style.left = `${left}%`;
  };
  updateBallPosition();

  function isBallTouchingWhichWall(ballElement: HTMLElement) {
    var parentRect = boundaryElement.getBoundingClientRect();
    var childRect = ballElement.getBoundingClientRect();

    // Check if any of the four corners of the inner element is outside of the outer element
    if (childRect.top < parentRect.top) {
      return "top";
    } else if (childRect.left < parentRect.left) {
      return "left";
    } else if (childRect.bottom > parentRect.bottom) {
      return "bottom";
    } else if (childRect.right > parentRect.right) {
      return "right";
    }
  }
  const renderBall: RenderFunction = (timeDelta) => {
    top += speedTop * timeDelta;
    left += speedLeft * timeDelta;
    updateBallPosition();
    const wallTouched = isBallTouchingWhichWall(ballEntity.element);
    switch (wallTouched) {
      case "bottom":
      case "top": {
        speedTop = -speedTop;
        top += speedTop * timeDelta;
        top += speedTop * timeDelta;
        break;
      }
      case "right":
      case "left": {
        speedLeft = -speedLeft;
        left += speedLeft * timeDelta;
        left += speedLeft * timeDelta;
        break;
      }
    }
    updateBallPosition();
  };

  addToRender(renderBall);

  flyingBall = ballEntity.element;
  newBall();
} catch (error) {
  console.error(error);
}
