import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "MatchFields" })
export class MatchFieldsConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    for (const property of args.constraints) {
      if (value !== (args.object as any)[property]) return false;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} does not match one of ${args.constraints.join(", ")}`;
  }
}

export function MatchFields(constraints: string[], options?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints,
      validator: MatchFieldsConstraint,
    });
  };
}
