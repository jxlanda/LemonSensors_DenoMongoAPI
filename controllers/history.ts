// history.ts
import { Context, HandlerFunc } from "https://deno.land/x/abc@v1.2.0/mod.ts";
import db from "../models/db.ts";
import { History, SensorMinimal } from "../models/json-models.ts";
import { ErrorHandler } from "../utils/middlewares.ts";

const database = db.getDatabase;
const history = database.collection<History>("history");

// create History
export const createHistory: HandlerFunc = async (c: Context) => {
  try {
    if (c.request.headers.get("content-type") !== "application/json") {
      throw new ErrorHandler("Invalid body", 422);
    }
    const body: any = await c.body;
    if (!Object.keys(body).length) {
      throw new ErrorHandler("Request body can not be empty!", 400);
    }

    var _history: History = body;
    _history.datetime = new Date();
    const isEvent: Number = body.isEvent;
    if (isEvent == 1) {
      _history.isEvent = true;
    } else if (isEvent == 0) {
      _history.isEvent = false;
    }

    const insertedSensor = await history.insertOne({
      datetime: new Date(),
      isEvent: _history.isEvent,
      sensor: _history.sensor,
      user: _history.user,
      value: _history.value,
    });
    return c.json(insertedSensor, 201);
  } catch (error) {
    throw new ErrorHandler(error.message, error.status || 500);
  }
};

// get all History
export const getAllHistory: HandlerFunc = async (c: Context) => {
  try {
    const historyList: any = await history.find();
    if (historyList) {
      return c.json(historyList, 200);
    }
    throw new ErrorHandler("There is no history", 404);
  } catch (error) {
    throw new ErrorHandler(error.message, error.status || 500);
  }
};

export const getHistoryByRange: HandlerFunc = async (c: Context) => {
  try {
    const body: any = await c.body;
    const fromDate = new Date(body.from);
    const toDate = new Date(body.to);
    toDate.setHours(23,59,59,999)
    toDate.getTime();
    const sensorid = body.sensorid;
    // { from: "2020-01-01", to: "2020-01-10", isEvent: true }
    console.log(body);

    const historyList: History[] = await history.find();
    var filterHistory: History[] = [];
    if(sensorid != null || sensorid != undefined){
      console.log(sensorid);
      filterHistory = historyList.filter((item) =>{
        let date = new Date(item.datetime);
        console.log(date.getUTCDate());
        console.log(toDate.getUTCDate());
        return date.getUTCDate() >= fromDate.getUTCDate()  && date.getUTCDate() <= toDate.getUTCDate() && item.sensor.id == sensorid;
      });
    } else {
      filterHistory = historyList.filter((item) =>{
        let date = new Date(item.datetime);
        console.log(date.getUTCDate());
        console.log(toDate.getUTCDate());
        return date.getUTCDate() >= fromDate.getUTCDate()  && date.getUTCDate() <= toDate.getUTCDate();
      });
    }

    if (filterHistory) {
      return c.json(filterHistory, 200);
    }

    throw new ErrorHandler("There is no history", 404);
  } catch (error) {
    throw new ErrorHandler(error.message, error.status || 500);
  }
};

// get history by id
export const getOneHistory: HandlerFunc = async (c: Context) => {
  try {
    const { id } = c.params as { id: string };
    const getRecord = await history.findOne({ _id: { "$oid": id } });
    if (getRecord) {
      const recordFound: History = getRecord;
      return c.json(recordFound, 200);
    }
    throw new ErrorHandler("Record in history not found", 404);
  } catch (error) {
    throw new ErrorHandler(error.message, error.status || 500);
  }
};
