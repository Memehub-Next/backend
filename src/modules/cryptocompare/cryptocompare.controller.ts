import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiProperty, ApiTags } from "@nestjs/swagger";
import { CryptoCompareService } from "./cryptocompare.service";

class BaseQuoteArgs {
  @ApiProperty()
  base: string;

  @ApiProperty()
  quote: string;
}

class CryptoPriceDTO {
  @ApiProperty()
  price: number;
}

@ApiTags("crypto")
@Controller("crypto")
export class CryptoCompareController {
  constructor(private readonly service: CryptoCompareService) {}

  @ApiOkResponse({ type: CryptoPriceDTO })
  @Get("price")
  async cryptoPrice(@Query() { base, quote }: BaseQuoteArgs) {
    return { price: await this.service.cryptoPrice({ base, quote }) };
  }
}
