export type SchemaValidator = (value: any) => boolean;

export type SchemaValidatorMessage = (value: any) => string;

export type SchemaProperty = [
  string,
  boolean,
  SchemaValidator,
  SchemaValidatorMessage?
];

export type Schema = SchemaProperty[];
