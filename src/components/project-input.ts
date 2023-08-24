import { Component } from './base-component';
import { Validatable, validate } from '../utils/validation';
import { autobind } from '../decorators/decorator';
import { projectState } from '../state/project-state';

// Project Input Class
export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
