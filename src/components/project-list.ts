import { Component } from './base-component';
import { ProjectItem } from './project-item';
import { autobind } from '../decorators/decorator';
import { DragTarget } from '../models/drag-drop-interfaces';
import { Project, ProjectStatus } from '../models/project-models';
import { projectState } from '../state/project-state';

// Project List Class
export class ProjectList
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
