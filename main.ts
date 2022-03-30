// main.ts
import { Application } from "https://deno.land/x/abc@v1.2.0/mod.ts";
import { parse } from 'https://deno.land/std@0.80.0/flags/mod.ts';
import "https://deno.land/x/dotenv@v1.0.1/load.ts";
import { abcCors } from "./mod.ts";

// JWT - Middleware
import {  
    generateJWT,
    validateJWT,
    jwtAuth
 } from "./middlewares/jwt.ts";
// Users
import {
    createUser,
    deleteUser,
    getAllUsers, 
    getOneUser, 
    updateUser,
    loginUser
} 
from "./controllers/users.ts";
// Sensors
import {
    createSensor,
    deleteSensor,
    getOneSensor,
    updateSensor,
    getAllSensors
}
from "./controllers/sensors.ts";
// History
import {
    createHistory,
    getAllHistory,
    getHistoryByRange,
    getOneHistory
}
from "./controllers/history.ts";
// Utils - Middlewares
import {
    ErrorMiddleware,
    LogMiddleware
} 
from "./utils/middlewares.ts";

const { args } = Deno;
const DEFAULT_PORT = 8000;
const argPort = parse(args).port;

const app = new Application();

app.use(abcCors()); // Enable CORS for All Routes
app.use(LogMiddleware)
    .use(ErrorMiddleware)
    .static("/", "www");


app.get("/", (context) =>{
    context.redirect("/index.html");
});

// Auth Routes
app.get("/generateToken", generateJWT)
    .get("/validateToken/:token", validateJWT);

// Cors
app.options("*", (c) => c, abcCors());
// Sensors Routes
app.get("/sensors", getAllSensors, jwtAuth)
    .post("/sensor/create", createSensor, jwtAuth)
    .get("/sensor/:id", getOneSensor, jwtAuth)
    .put("/sensor/:id", updateSensor, jwtAuth)
    .delete("/sensor/:id", deleteSensor, jwtAuth);

// History Routes
app.get("/history", getAllHistory, jwtAuth)
    .post("/history/create", createHistory)
    .get("/history/:id", getOneHistory, jwtAuth)
    .post("/history/range", getHistoryByRange, jwtAuth);

// Users Routes
app.get("/users", getAllUsers, jwtAuth)
    .post("/user/create", createUser, jwtAuth)
    .get("/user/:id", getOneUser, jwtAuth)
    .put("/user/:id", updateUser, jwtAuth)
    .delete("/user/:id", deleteUser, jwtAuth)
    .post("/login", loginUser, abcCors())
    .start({ port: argPort ? Number(argPort) : DEFAULT_PORT });

console.log("server running!!");