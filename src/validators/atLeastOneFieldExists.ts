import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "AtLeastOneFieldExists" })
export class AtLeastOneFieldExistsConstraint implements ValidatorConstraintInterface {
  validate(_value: any, args: ValidationArguments) {
    for (let propName of args.constraints) if (typeof (args.object as any)[propName] !== "undefined") return true;
    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return `At least one of ${args.constraints.join(", ")} must be provided`;
  }
}

export function AtLeastOneFieldExists(properties: string[], validationOptions?: ValidationOptions) {
  return (object: Object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      constraints: properties,
      options: validationOptions,
      validator: AtLeastOneFieldExistsConstraint,
    });
  };
}
