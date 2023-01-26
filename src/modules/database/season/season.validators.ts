import { Injectable } from "@nestjs/common";
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { SeasonService } from "./season.service";

@ValidatorConstraint({ async: true })
@Injectable()
export class SeasonIdConstraint implements ValidatorConstraintInterface {
  constructor(private seasonService: SeasonService) {}

  async validate(seasonId: number, _args: ValidationArguments) {
    const currentSeasonId = await this.seasonService.getCurrentSeasonId();
    return 1 <= seasonId && seasonId <= currentSeasonId;
  }

  defaultMessage() {
    return "seasonId out of bounds";
  }
}
