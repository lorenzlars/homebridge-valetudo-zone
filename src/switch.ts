import { AccessoryPlugin, HAP, Logging, Service } from "homebridge";
import { MapSegmentationCapability } from "./dynamic-platform";
import axios from "axios";

export class SegmentSwitch implements AccessoryPlugin {
  private readonly log: Logging;

  // This property must be existent!!
  name: string;

  private readonly switchService: Service;
  private readonly informationService: Service;

  constructor(
    hap: HAP,
    log: Logging,
    capability: MapSegmentationCapability,
    ip: string
  ) {
    this.log = log;
    this.name = capability.name;

    this.switchService = new hap.Service.Switch(`${capability.name} Clean`);
    this.switchService
      .getCharacteristic(hap.Characteristic.On)
      .onSet(async () => {
        await axios.put(
          `http://${ip}/api/v2/robot/capabilities/MapSegmentationCapability`,
          {
            action: "start_segment_action",
            segment_ids: [capability.id],
          }
        );

        setTimeout(() => {
          this.switchService
            .getCharacteristic(hap.Characteristic.On)
            .setValue(false);
        }, 2000);
      })
      .onGet(() => false);

    this.informationService = new hap.Service.AccessoryInformation()
      .setCharacteristic(hap.Characteristic.Manufacturer, "Valetudo")
      .setCharacteristic(hap.Characteristic.Model, "Segment Clean");

    log.info("Switch '%s' created!", `${capability.name} Clean`);
  }

  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices(): Service[] {
    return [this.informationService, this.switchService];
  }
}
