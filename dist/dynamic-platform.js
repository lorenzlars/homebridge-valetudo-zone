"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const PLUGIN_NAME = "homebridge-valetudo-zone";
const PLATFORM_NAME = "ValetudoZone";
class ExampleDynamicPlatform {
    constructor(log, config, api) {
        log.info("ValetudoZone platform finished initializing!");
        api.on("didFinishLaunching" /* DID_FINISH_LAUNCHING */, () => {
            log.info("ValetudoZone platform 'didFinishLaunching'");
            axios_1.default
                .get(`http://${"192.168.10.69"}/api/v2/robot/capabilities/MapSegmentationCapability`)
                .then((response) => {
                const uuid = api.hap.uuid.generate("SOMETHING UNIQUE");
                const accessory = new api.platformAccessory("DISPLAY NAME", uuid);
            });
        });
    }
    configureAccessory(accessory) { }
}
