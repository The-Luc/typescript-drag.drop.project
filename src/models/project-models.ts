export enum ProjectStatus {
  Active = 'active',
  Finished = 'finished',
}

export class Project {
  constructor(
    public id: number,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus,
  ) {}
}
