import { HttpService } from "@nestjs/axios";
import { CacheInterceptor, CacheKey, Injectable, UseInterceptors } from "@nestjs/common";
import { lastValueFrom } from "rxjs";

enum ECryptoCompareApi {
  Price = "/data/price",
}

@Injectable()
export class CryptoCompareService {
  constructor(private readonly httpService: HttpService) {}

  @CacheKey("CryptoCompare:")
  @UseInterceptors(CacheInterceptor)
  async cryptoPrice({ base, quote }: { quote: string; base: string }) {
    const resp$ = this.httpService.get<Record<string, number>>(ECryptoCompareApi.Price, { params: { fsym: base, tsyms: quote } });
    const resp = await lastValueFrom(resp$);
    return resp.data[quote];
  }
}
