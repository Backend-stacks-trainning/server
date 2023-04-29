export interface ISendEvent {
  msg: string;
  data: object | string;
}

export interface ITodo {
  todoId: string;
  title?: string;
  timestamp?: string | Date;
}

export interface JsonRespond {
  statusCode: number;
  message: string;
  data?: object | string;
  error?: string;
}
