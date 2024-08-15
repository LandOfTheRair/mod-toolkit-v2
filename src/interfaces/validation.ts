export interface ValidationMessageGroup {
  header: string;
  messages: ValidationMessage[];
}

export interface ValidationMessage {
  type: 'warning' | 'good' | 'error';
  message: string;
}
