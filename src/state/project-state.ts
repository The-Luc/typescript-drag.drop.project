namespace App {
  let projectId = 0;
  type Listener<T> = (items: T[]) => void;
  export class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(listenerFn: Listener<T>) {
      this.listeners.push(listenerFn);
    }
  }

  // Project State
  export class ProjectState extends State<Project> {
    private projects: Project[] = [
      {
        id: 999,
        title: 'Test Project',
        description: 'This is a test project',
        people: 1,
        status: ProjectStatus.Active,
      },
    ];
    private static instance: any;

    private constructor() {
      super();
    }

    static getInstance(): ProjectState {
      if (!this.instance) this.instance = new ProjectState();

      return this.instance;
    }

    addProject(title: string, description: string, numOfPeople: number) {
      const newProject = new Project(
        ++projectId,
        title,
        description,
        numOfPeople,
        ProjectStatus.Active,
      );
      this.projects.push(newProject);

      for (const listenerFn of this.listeners) {
        listenerFn(this.projects.slice());
      }
    }

    changeStatus(id: number, newStatus: ProjectStatus) {
      const project = this.projects.find(project => project.id === id);
      if (project && project.status !== newStatus) {
        project.status = newStatus;
        this.updateListeners();
      }
    }

    updateListeners() {
      for (const listenerFn of this.listeners) {
        listenerFn(this.projects.slice());
      }
    }
  }
}
