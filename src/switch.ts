import { AccessoryPlugin, HAP, Logging, Service } from "homebridge";
import { MapSegmentationCapability } from "./dynamic-platform";
import axios from "axios";

type Attributes = {
  __class: "StatusStateAttribute";
  value: string;
};

export class SegmentSwitch implements AccessoryPlugin {
  private readonly hap: HAP;
  private readonly log: Logging;
  private readonly capability: MapSegmentationCapability;
  private readonly ip: string;

  private eventListener: ((value: boolean) => void)[];

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

    this.eventListener = [];

    this.name = capability.name;

    this.switchService = new this.hap.Service.Switch(
      `${this.capability.name} Clean`
    );
    this.switchService
      .getCharacteristic(this.hap.Characteristic.On)
      .onSet(this.setOnHandler)
      .onGet(this.getOnHandler);

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

  async getOnHandler() {
    const attributes = await axios
      .get(`http://${this.ip}/api/v2/robot/state/attributes`)
      .then((response) => response.data as Attributes[]);

    return !!attributes.find(
      (attribute) =>
        attribute.__class === "StatusStateAttribute" &&
        attribute.value !== "docked"
    );
  }

  async setOnHandler(value: any) {
    if (value) {
      await axios.put(
        `http://${this.ip}/api/v2/robot/capabilities/MapSegmentationCapability`,
        {
          action: "start_segment_action",
          segment_ids: [this.capability.id],
        }
      );

      this.log.info(`${this.name} will be cleaned`);
    } else {
      await axios.put(
        `http://${this.ip}/api/v2/robot/capabilities/BasicControlCapability`,
        { action: "pause" }
      );

      setTimeout(
        async () =>
          await axios.put(
            `http://${this.ip}/api/v2/robot/capabilities/BasicControlCapability`,
            { action: "home" }
          ),
        2000
      );

      this.log.info("Vacuum returning to the dock");
    }

    this.eventListener.forEach((eventListener) => {
      eventListener(value);
    });
  }

  public setState(value: boolean) {
    this.switchService.updateCharacteristic(this.hap.Characteristic.On, value);
    this.log.info(`${this.name} Clean switch has been set to ${value}`);
  }

  public addEventListener(type: string, callback: (value: boolean) => void) {
    // TODO: use the event type
    this.eventListener.push(callback);
    this.log.debug("Event listener added");
  }

  public removeEventListener() {
    // TODO: Do I need this?
  }
}
