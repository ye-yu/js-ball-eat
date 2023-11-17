// @ts-expect-error
import BALL from "./ball.xml";
import "./ball.css";

const templates = {
  BALL,
};

const loadedTemplates: Record<string, string> = {};
const loadedTemplateId: Record<string, string> = {};

async function loadTemplate(name: string) {
  const retries = 5;
  for (let retryCount = 0; retryCount < retries; retryCount++) {
    try {
      const content = await fetch(name);
      return content.text();
    } catch (error) {
      console.error(retryCount, "Failed to load asset", name, error);
    }
  }
  return null;
}

export async function initialiseTemplates() {
  const asyncTasks = Object.entries(templates).map(async ([key, value]) => {
    const templateContent = await loadTemplate(value);
    if (!templateContent) {
      throw key;
    }
    loadedTemplates[key] = templateContent;
  });

  const asyncResult = await Promise.allSettled(asyncTasks);
  const rejectedAsync = asyncResult.filter(
    (e) => e.status === "rejected"
  ) as PromiseRejectedResult[];
  if (rejectedAsync.length) {
    const failedResources = rejectedAsync.map((e) => e.reason);
    throw new Error(`Failed to load resources: ${failedResources}`);
  }

  const [firstBody] = document.getElementsByTagName("body");

  if (!firstBody) {
    throw new Error("Weird. HTML has no <body>");
  }

  for (const [templateName, content] of Object.entries(loadedTemplates)) {
    const node = document.createElement("div");
    node.innerHTML = content;
    const [firstTemplate] = node.getElementsByTagName("template");
    if (!firstTemplate) {
      throw new Error(`Template ${templateName} has no <template>`);
    }
    const [_, ...nextDivs] = getElementNodes(firstTemplate.content);
    if (nextDivs.length) {
      throw new Error(
        `Template ${templateName} has more than one child element`
      );
    }
    const templateId = crypto.randomUUID();
    firstTemplate.setAttribute("id", templateId);
    loadedTemplateId[templateName] = templateId;
    firstBody.appendChild(node);
  }
}

function getElementNodes(element: Node): HTMLElement[] {
  const childNodes = element.childNodes;
  const elementNodes = new Array<HTMLElement>();

  for (let i = 0; i < childNodes.length; i++) {
    const node = childNodes[i];

    // Check if the node is an element node (Node.ELEMENT_NODE)
    if (node.nodeType === Node.ELEMENT_NODE) {
      elementNodes.push(node as HTMLElement);
    }
  }

  return elementNodes;
}

export function instantiateTemplate(name: keyof typeof templates) {
  const templateId = loadedTemplateId[name];
  const template = document.getElementById(
    templateId
  ) as HTMLTemplateElement | null;
  if (!template) {
    throw new Error(`Cannot find template: ${name}`);
  }
  const templateContent = template.content;

  const element = templateContent.cloneNode(true);
  const [firstElement] = getElementNodes(element);
  const entityId = crypto.randomUUID();
  firstElement.setAttribute("entity-id", entityId);
  return { entityId, element };
}
