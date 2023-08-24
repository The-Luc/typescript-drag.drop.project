export class Component<T extends HTMLElement, U extends HTMLElement> {
  private templateElement: HTMLTemplateElement;
  private hostElement: T;
  protected element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    newElementId?: string,
  ) {
    this.templateElement = document.getElementById(
      templateId,
    )! as HTMLTemplateElement;

    this.hostElement = document.getElementById(hostElementId)! as T;

    const importedNode = document.importNode(
      this.templateElement.content,
      true,
    );

    this.element = importedNode.firstElementChild as U;

    if (newElementId) this.element.id = newElementId;

    this.attach();
  }

  attach() {
    this.hostElement.insertAdjacentElement('beforeend', this.element);
  }
}
