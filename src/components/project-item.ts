import { Project, ProjectStatus } from '../models/project-models';
import { Component } from './base-component';
import { Draggable } from '../models/drag-drop-interfaces';
import { autobind } from '../decorators/decorator';
import { projectState } from '../state/project-state';

export class ProjectItem
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
    this.element.querySelector('h3')!.textContent = this.persons + ' assigned';
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
