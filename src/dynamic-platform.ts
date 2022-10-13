import {
  AccessoryPlugin,
  API,
  HAP,
  Logging,
  PlatformConfig,
  StaticPlatformPlugin,
} from "homebridge";
import axios from "axios";
import { SegmentSwitch } from "./switch";

let hap: HAP;

export type MapSegmentationCapability = {
  id: string;
  name: string;
};

export default (api: API) => {
  hap = api.hap;

  api.registerPlatform("ValetudoZone", ExampleDynamicPlatform);
};

class ExampleDynamicPlatform implements StaticPlatformPlugin {
  private readonly ip: string;
  private readonly log: Logging;

  constructor(log: Logging, config: PlatformConfig) {
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
      .then((response) => response.data as MapSegmentationCapability[])
      .then((segements) => {
        const accessories = segements.map(
          (segment) => new SegmentSwitch(hap, this.log, segment, this.ip)
        );

        accessories.forEach((accessory) => {
          accessory.addEventListener("set", (value) => {
            if (value) {
              accessories.forEach((accessory) => {
                accessory.setState(true);
              });
            }
          });
        });

        callback(accessories);
      });
  }
}
