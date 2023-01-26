import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { CryptoCompareController } from "./cryptocompare.controller";
import { CryptoCompareService } from "./cryptocompare.service";

@Module({
  imports: [HttpModule.register({ baseURL: "https://min-api.cryptocompare.com" })],
  providers: [CryptoCompareService],
  controllers: [CryptoCompareController],
  exports: [CryptoCompareService],
})
export class CryptoCompareModule {}
