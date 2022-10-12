import { AccessoryPlugin, HAP, Logging, Service } from "homebridge";
import { MapSegmentationCapability } from "./dynamic-platform";
import axios from "axios";

export class SegmentSwitch implements AccessoryPlugin {
  private readonly hap: HAP;
  private readonly log: Logging;
  private readonly capability: MapSegmentationCapability;
  private readonly ip: string;

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
    this.hap = hap;
    this.log = log;
    this.capability = capability;
    this.ip = ip;

    this.name = capability.name;

    this.switchService = new this.hap.Service.Switch(
      `${this.capability.name} Clean`
    );
    this.switchService
      .getCharacteristic(this.hap.Characteristic.On)
      .onSet(this.setOnHandler.bind(this))
      .onGet(this.getOnHandler.bind(this));

    this.informationService = new this.hap.Service.AccessoryInformation()
      .setCharacteristic(this.hap.Characteristic.Manufacturer, "Valetudo")
      .setCharacteristic(this.hap.Characteristic.Model, "Segment Clean");

    this.log.info("Switch '%s' created!", `${this.capability.name} Clean`);
  }

  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices(): Service[] {
    return [this.informationService, this.switchService];
  }

  getOnHandler() {
    return false;
  }

  async setOnHandler(value: any) {
    await axios.put(
      `http://${this.ip}/api/v2/robot/capabilities/MapSegmentationCapability`,
      {
        action: "start_segment_action",
        segment_ids: [this.capability.id],
      }
    );

    setTimeout(() => {
      this.switchService.updateCharacteristic(
        this.hap.Characteristic.On,
        false
      );
    }, 5000);
  }
}
