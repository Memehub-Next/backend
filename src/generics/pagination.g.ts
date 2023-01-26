import { Type } from "@nestjs/common";
import { ArgsType, Field, Int, ObjectType } from "@nestjs/graphql";
import { IsInt, Max, Min } from "class-validator";

@ArgsType()
export class TakeArg {
  @Min(0)
  @Max(50)
  @IsInt()
  @Field(() => Int)
  take: number;
}

@ArgsType()
export class PaginatedArgs extends TakeArg {
  @Min(0)
  @IsInt()
  @Field(() => Int)
  skip: number;
}

// DTO => Data Transfer Object
// PDTO => Paginated Data Transfer Object

export interface IPDTO<TEntity> {
  items: TEntity[];
  hasMore: boolean;
}

export function CreatePDTO<TEntity>(classRef: Type<TEntity>): Type<IPDTO<TEntity>> {
  @ObjectType({ isAbstract: true })
  abstract class PDTO implements IPDTO<TEntity> {
    @Field(() => [classRef])
    items: TEntity[];

    @Field()
    hasMore: boolean;
  }

  return PDTO as Type<IPDTO<TEntity>>;
}
