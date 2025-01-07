export class MessageResponse<T = any> {
  responseCode: number;
  message: string;
  data: T;
  constructor(responseCode: number, message: string, data: T) {
    this.responseCode = responseCode;
    this.message = message;
    this.data = data;
  }
}
