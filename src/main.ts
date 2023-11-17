import "./style.css";
import { initialiseTemplates, instantiateTemplate } from "./templates/manager";

const boundaries = document.getElementsByClassName("boundary");
if (!boundaries.length) {
  throw new Error(`<div class="boundary"> cannot be found`);
}

const boundaryElement = boundaries[0];

try {
  await initialiseTemplates();
  const ballEntity = instantiateTemplate("BALL");
  boundaryElement.appendChild(ballEntity.element);
} catch (error) {
  console.error(error);
}
