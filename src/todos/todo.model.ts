import { UUID } from 'crypto';

export class Todo {
  constructor(
    public id: UUID,
    public title: string,
    public content: string,
    public priority: number,
  ) {}
}
