/// <reference path="models/drag-drop-interfaces.ts" />
/// <reference path="models/project-models.ts" />
/// <reference path="utils/validation.ts" />
/// <reference path="state/project-state.ts" />
/// <reference path="decorators/decorator.ts" />

namespace App {
  const projectState = ProjectState.getInstance();

  // Base Component Class
  class Component<T extends HTMLElement, U extends HTMLElement> {
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

  class ProjectItem
    extends Component<HTMLUListElement, HTMLLIElement>
    implements Draggable
  {
    get persons() {
      return this.project.people === 1
        ? '1 person'
        : `${this.project.people} persons`;
    }
    private project: Project;
    private doneBtn: HTMLButtonElement;

    constructor(hostId: string, project: Project) {
      super('single-project', hostId, project.id.toString());
      this.project = project;

      this.doneBtn = this.element.querySelector('button')!;

      this.renderContent();
      this.configure();
    }

    @autobind
    dragStartHandler(event: DragEvent): void {
      event.dataTransfer!.setData('text/plain', this.project.id.toString());
      event.dataTransfer!.effectAllowed = 'move';
    }

    @autobind
    dragEndHandler(_: DragEvent): void {
      //
      console.log('DragEnd');
    }

    private renderContent() {
      this.element.querySelector('h2')!.textContent = this.project.title;
      this.element.querySelector('h3')!.textContent =
        this.persons + ' assigned';
      this.element.querySelector('p')!.textContent = this.project.description;
    }

    @autobind
    private markProjectDone() {
      const status =
        this.project.status === ProjectStatus.Active
          ? ProjectStatus.Finished
          : ProjectStatus.Active;
      projectState.changeStatus(this.project.id, status);
    }

    private configure() {
      this.doneBtn.addEventListener('click', this.markProjectDone);
      this.element.addEventListener('dragstart', this.dragStartHandler);
      this.element.addEventListener('dragend', this.dragEndHandler);
    }
  }

  // Project List Class
  class ProjectList
    extends Component<HTMLDivElement, HTMLElement>
    implements DragTarget
  {
    constructor(
      private type: 'active' | 'finished',
      private assignedProjects: Project[] = [],
    ) {
      super('project-list', 'app', `${type}-projects`);

      this.attach();
      this.renderContent();
      this.configure();
    }

    @autobind
    dragOverHandler(event: DragEvent): void {
      if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
        const listEl = this.element.querySelector('ul')!;
        listEl.classList.add('droppable');
        event.preventDefault();
      }
    }

    @autobind
    dropHandler(event: DragEvent): void {
      const projectId = event.dataTransfer!.getData('text/plain');
      projectState.changeStatus(
        +projectId,
        this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished,
      );
    }

    @autobind
    dragLeaveHandler(_: DragEvent): void {
      const listEl = this.element.querySelector('ul')!;
      listEl.classList.remove('droppable');
    }

    private configure() {
      this.element.addEventListener('dragover', this.dragOverHandler);
      this.element.addEventListener('drop', this.dropHandler);
      this.element.addEventListener('dragleave', this.dragLeaveHandler);

      projectState.addListener((projects: Project[]) => {
        this.assignedProjects = projects.filter(
          project => project.status === this.type,
        );
        this.renderProjects();
      });
    }

    private renderProjects() {
      const listId = `${this.type}-projects-list`;
      const listEl = document.getElementById(listId)! as HTMLUListElement;

      listEl.innerHTML = '';

      for (const projectItem of this.assignedProjects) {
        new ProjectItem(listId, projectItem);
      }
    }

    private renderContent() {
      const listId = `${this.type}-projects-list`;

      this.element.querySelector('ul')!.id = listId;
      this.element.querySelector('h2')!.textContent =
        this.type.toUpperCase() + ' PROJECTS';
    }
  }

  // Project Input Class
  class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleEl: HTMLInputElement;
    descriptionEl: HTMLInputElement;
    peopleEl: HTMLInputElement;

    constructor() {
      super('project-input', 'app', 'user-input');

      this.titleEl = this.element.querySelector('#title') as HTMLInputElement;
      this.descriptionEl = this.element.querySelector(
        '#description',
      ) as HTMLInputElement;
      this.peopleEl = this.element.querySelector('#people') as HTMLInputElement;

      this.configure();
      this.attach();
    }

    private gatherUserInput(): [string, string, number] | void {
      const enteredTitle = this.titleEl.value;
      const enteredDescription = this.descriptionEl.value;
      const enteredPeople = this.peopleEl.value;

      const titleValidatable: Validatable = {
        value: enteredTitle,
        required: true,
      };

      const descriptionValidatable: Validatable = {
        value: enteredDescription,
        required: true,
        minLength: 5,
      };

      const peopleValidatable: Validatable = {
        value: +enteredPeople,
        required: true,
        min: 1,
        max: 5,
      };

      if (
        !validate(titleValidatable) ||
        !validate(descriptionValidatable) ||
        !validate(peopleValidatable)
      ) {
        alert('Invalid input, please try again!');
        return;
      }

      return [enteredTitle, enteredDescription, +enteredPeople];
    }

    @autobind
    private submitHandler(event: Event) {
      event.preventDefault();
      const userInput = this.gatherUserInput();

      if (Array.isArray(userInput)) {
        const [title, desc, people] = userInput;
        projectState.addProject(title, desc, people);
        this.clearInputs();
      }
    }

    private clearInputs() {
      this.titleEl.value = '';
      this.descriptionEl.value = '';
      this.peopleEl.value = '';
    }

    private configure() {
      this.element.addEventListener('submit', this.submitHandler);
    }
  }

  new ProjectInput();
  new ProjectList('active');
  new ProjectList('finished');

  projectState.updateListeners();
}
