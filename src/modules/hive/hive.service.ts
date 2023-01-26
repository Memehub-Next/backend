import { Account, Authority, Client, CreateClaimedAccountOperation, PrivateKey } from "@hiveio/dhive";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { hiveEnvironment } from "../../config/keys/hive.config";

export interface AllHiveKeys {
  owner: string;
  active: string;
  posting: string;
  memo: string;
  ownerPubkey: string;
  activePubkey: string;
  postingPubkey: string;
  memoPubkey: string;
}

@Injectable()
export class HiveService {
  nodes = [
    "https://api.deathwing.me",
    "https://api.hive.blog",
    "https://anyx.io",
    "https://api.openhive.network",
    "https://api.hivekings.com",
  ];

  dhive: Client;

  constructor(
    @Inject(hiveEnvironment.KEY)
    private readonly hiveEnv: ConfigType<typeof hiveEnvironment>
  ) {
    this.dhive = this.getClient();
  }

  getClient() {
    return new Client(this.nodes);
  }

  async lookupAccountNames(names: string[]): Promise<(Account | null)[]> {
    return this.dhive.database.call("lookup_account_names", [names]);
  }

  async acctNameExists(username: string) {
    const accounts = await this.lookupAccountNames([username]);
    return !!accounts.length && accounts.every((acc) => acc != null);
  }

  getKeys(username: string, password: string): AllHiveKeys {
    const privKeys = {
      owner: PrivateKey.fromLogin(username, password, "owner").toString(),
      active: PrivateKey.fromLogin(username, password, "active").toString(),
      posting: PrivateKey.fromLogin(username, password, "posting").toString(),
      memo: PrivateKey.fromLogin(username, password, "memo").toString(),
    };
    const pubKeys = {
      ownerPubkey: PrivateKey.from(privKeys.owner).createPublic().toString(),
      activePubkey: PrivateKey.from(privKeys.active).createPublic().toString(),
      postingPubkey: PrivateKey.from(privKeys.posting).createPublic().toString(),
      memoPubkey: PrivateKey.from(privKeys.memo).createPublic().toString(),
    };
    return { ...privKeys, ...pubKeys };
  }

  createClaimedAccountOperation(new_account_name: string, password: string): CreateClaimedAccountOperation {
    const keys = this.getKeys(new_account_name, password);
    return [
      "create_claimed_account",
      {
        active: Authority.from(keys.activePubkey),
        creator: this.hiveEnv.memehubAcct,
        extensions: [],
        json_metadata: JSON.stringify({ app: "memehub:beta" }),
        memo_key: keys.memoPubkey,
        new_account_name,
        owner: Authority.from(keys.ownerPubkey),
        posting: Authority.from(keys.postingPubkey),
      },
    ];
  }
}
