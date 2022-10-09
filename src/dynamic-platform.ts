import {
  AccessoryPlugin,
  API,
  HAP,
  Logging,
  PlatformConfig,
  StaticPlatformPlugin,
} from "homebridge";
import axios from "axios";
import { ExampleSwitch } from "./switch";

let hap: HAP;

export = (api: API) => {
  hap = api.hap;

  api.registerPlatform("ValetudoZone", ExampleDynamicPlatform);
};

class ExampleDynamicPlatform implements StaticPlatformPlugin {
  private readonly ip: string;
  private readonly log: Logging;

  constructor(log: Logging, config: PlatformConfig, api: API) {
    this.log = log;

    this.ip = config.ip;

    log.info("ValetudoZone platform finished initializing!");
  }

  /*
   * This method is called to retrieve all accessories exposed by the platform.
   * The Platform can delay the response my invoking the callback at a later time,
   * it will delay the bridge startup though, so keep it to a minimum.
   * The set of exposed accessories CANNOT change over the lifetime of the plugin!
   */
  accessories(callback: (foundAccessories: AccessoryPlugin[]) => void): void {
    axios
      .get(
        `http://${this.ip}/api/v2/robot/capabilities/MapSegmentationCapability`
      )
      .then((response) => {
        this.log.info(response.data);
      });

    callback([
      new ExampleSwitch(hap, this.log, "Switch 1"),
      new ExampleSwitch(hap, this.log, "Switch 2"),
    ]);
  }
}
