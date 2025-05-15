export class Device {
  id: string;
  name: string;
  model: string;
  status: string;

  constructor(id: string, name: string, model: string, status: string) {
    this.id = id;
    this.name = name;
    this.model = model;
    this.status = status;
  }
}
