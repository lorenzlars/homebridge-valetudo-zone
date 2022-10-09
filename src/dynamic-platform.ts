import http, { IncomingMessage, Server, ServerResponse } from "http";
import {
  API,
  APIEvent,
  CharacteristicEventTypes,
  CharacteristicSetCallback,
  CharacteristicValue,
  DynamicPlatformPlugin,
  HAP,
  Logging,
  PlatformAccessory,
  PlatformAccessoryEvent,
  PlatformConfig,
} from "homebridge";
import axios from "axios";

const PLUGIN_NAME = "homebridge-valetudo-zone";
const PLATFORM_NAME = "ValetudoZone";

let hap: HAP;

export = (api: API) => {
  hap = api.hap;

  api.registerPlatform(PLATFORM_NAME, ExampleDynamicPlatform);
};

class ExampleDynamicPlatform implements DynamicPlatformPlugin {
  constructor(log: Logging, config: PlatformConfig, api: API) {
    log.info("ValetudoZone platform finished initializing!");

    api.on(APIEvent.DID_FINISH_LAUNCHING, () => {
      log.info("ValetudoZone platform 'didFinishLaunching'");

      axios
        .get(
          `http://${config.ip}/api/v2/robot/capabilities/MapSegmentationCapability`
        )
        .then((response) => {
          log.debug(response.data);

          const uuid = api.hap.uuid.generate("SOMETHING UNIQUE");
          const accessory = new api.platformAccessory("DISPLAY NAME", uuid);
        });
    });
  }

  configureAccessory(accessory: PlatformAccessory): void {}
}
