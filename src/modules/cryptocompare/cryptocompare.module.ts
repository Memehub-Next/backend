import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { CryptoCompareResolver } from "./cryptocompare.resolver";
import { CryptoCompareService } from "./cryptocompare.service";

@Module({
  imports: [HttpModule.register({ baseURL: "https://min-api.cryptocompare.com" })],
  providers: [CryptoCompareService, CryptoCompareResolver],
  exports: [CryptoCompareService],
})
export class CryptoCompareModule {}
