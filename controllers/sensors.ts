// sensors.ts
import { Context, HandlerFunc } from "https://deno.land/x/abc@v1.2.0/mod.ts";
import db from "../models/db.ts";
import { Sensor, Config } from "../models/json-models.ts";
import { ErrorHandler } from "../utils/middlewares.ts";

const database = db.getDatabase;
const sensors = database.collection<Sensor>("sensors");

// create Sensor
export const createSensor: HandlerFunc = async (c: Context) => {
    try {

      if (c.request.headers.get("content-type") !== "application/json") {
        throw new ErrorHandler("Invalid body", 422);
      }
      const body: any = await c.body;
      if (!Object.keys(body).length) {
        throw new ErrorHandler("Request body can not be empty!", 400);
      }

      var sensor: Sensor = body;
      
      const insertedSensor = await sensors.insertOne({
        brand: sensor.brand,
        category: sensor.category,
        config: sensor.config,
        description: sensor.description,
        maxvoltage: sensor.maxvoltage,
        measurement: sensor.measurement,
        minvoltage: sensor.minvoltage,
        model: sensor.model,
        name: sensor.name,
        storageplace: sensor.storageplace,
        user: sensor.user
      });
      return c.json(insertedSensor, 201);

    } catch (error) {
      throw new ErrorHandler(error.message, error.status || 500);
    }
};

// get all Sensors
export const getAllSensors: HandlerFunc = async (c: Context) => {
    try {
      const sensorsList: any = await sensors.find({ name: { $ne: null } });
      if (sensorsList) {
        return c.json(sensorsList, 200);
      }
      throw new ErrorHandler("Sensors not found", 404);
    } catch (error) {
      throw new ErrorHandler(error.message, error.status || 500);
    }
};

// get one Sensor
export const getOneSensor: HandlerFunc = async (c: Context) => {
    try {
      const { id } = c.params as { id: string};
      const getSensor = await sensors.findOne({ _id: { "$oid": id } });
      if (getSensor) {
        const sensorFound: Sensor = getSensor;
        return c.json(sensorFound, 200);
      }
      throw new ErrorHandler("Sensor not found", 404);
    } catch (error) {
      throw new ErrorHandler(error.message, error.status || 500);
    }
};

// update Sensor
export const updateSensor: HandlerFunc = async (c: Context) => {
    try {
      const { id } = c.params as { id: string };
      if (c.request.headers.get("content-type") !== "application/json") {
        throw new ErrorHandler("Invalid body", 422);
      }
      const body: any = await c.body;
      var sensor: Sensor = body;

      if (!Object.keys(body).length) {
        throw new ErrorHandler("Request body can not be empty!", 400);
      }
      const sensorFound = await sensors.findOne({ _id: { "$oid": id } });
      if (sensorFound) {
        const { matchedCount } = await sensors.updateOne(
          { _id: { "$oid": id } },
          { $set: sensor },
        );
        if (matchedCount) {
          return c.json({message: "Sensor updated successfully!"});
        }
        return c.json({message: "Unable to update sensor"});
      }
      throw new ErrorHandler("Sensor not found", 404);
    } catch (error) {
      throw new ErrorHandler(error.message, error.status || 500);
    }
};

// delete Sensor
export const deleteSensor: HandlerFunc = async (c: Context) => {
    try {
      const { id } = c.params as { id: string };
      const getSensor: any = await sensors.findOne({ _id: { "$oid": id } });
      if (getSensor) {
        const deleteCount = await sensors.deleteOne({ _id: { "$oid": id } });
        if (deleteCount) {
          return c.json({message: "Sensor deleted successfully!"});
        }
        throw new ErrorHandler("Unable to delete sensor", 400);
      }
      throw new ErrorHandler("Sensor not found", 404);
    } catch (error) {
      throw new ErrorHandler(error.message, error.status || 500);
    }
};