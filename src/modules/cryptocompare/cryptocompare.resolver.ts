import { CacheInterceptor, CacheKey, UseInterceptors } from "@nestjs/common";
import { Args, ArgsType, Field, Float, InputType, ObjectType, Query, Resolver } from "@nestjs/graphql";
import { CryptoCompareService } from "./cryptocompare.service";

@InputType()
class PairArg {
  @Field()
  base: string;

  @Field()
  quote: string;
}

@ArgsType()
class PairArgs {
  @Field(() => [PairArg])
  pairs: PairArg[];
}

@ObjectType()
class PairPriceDTO {
  @Field()
  base: string;

  @Field()
  quote: string;

  @Field(() => Float)
  price: number;
}

@Resolver()
export class CryptoCompareResolver {
  constructor(private readonly CryptoCompareService: CryptoCompareService) {}

  @Query(() => [PairPriceDTO])
  @CacheKey("CryptoCompare:")
  @UseInterceptors(CacheInterceptor)
  async getCryptoPrices(@Args() { pairs }: PairArgs): Promise<PairPriceDTO[]> {
    let result: PairPriceDTO[] = [];
    for (const pair of pairs) {
      result.push({
        ...pair,
        price: await this.CryptoCompareService.cryptoPrice(pair),
      });
    }
    return result;
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}
