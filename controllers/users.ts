// users.ts
import { Context, HandlerFunc } from "https://deno.land/x/abc@v1.2.0/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.2.4/mod.ts";
import db from "../models/db.ts";
import { User, Role } from "../models/json-models.ts";
import { ErrorHandler } from "../utils/middlewares.ts";
// JWT - Middleware
import {  
  generateJWT,
} from "../middlewares/jwt.ts";

const database = db.getDatabase;
const users = database.collection<User>("users");

// create User
export const createUser: HandlerFunc = async (c: Context) => {
    try {

      if (c.request.headers.get("content-type") !== "application/json") {
        throw new ErrorHandler("Invalid body", 422);
      }
      const body: any = await c.body;
      if (!Object.keys(body).length) {
        throw new ErrorHandler("Request body can not be empty!", 400);
      }

      const { name, username, email, password, imgurl, tokenfcm, role } = body;
      const encryptPassword = await bcrypt.hash(password);
      // Check password
      //const result = await bcrypt.compare("test", hash);
      const insertedUser = await users.insertOne({
        name,
        username,
        email: email,
        password: encryptPassword,
        tokensfcm: tokenfcm,
        imgurl: imgurl,
        role: role
      });
      return c.json(insertedUser, 201);
    } catch (error) {
      throw new ErrorHandler(error.message, error.status || 500);
    }
  };
  
  // get all Users
  export const getAllUsers: HandlerFunc = async (c: Context) => {
    try {
      const usersList: any = await users.find({ name: { $ne: null } });
      if (usersList) {
        return c.json(usersList, 200);
      }
      throw new ErrorHandler("User not found", 404);
    } catch (error) {
      throw new ErrorHandler(error.message, error.status || 500);
    }
  };

// get one User
export const getOneUser: HandlerFunc = async (c: Context) => {
  try {
    const { id } = c.params as { id: string};
    const getUser = await users.findOne({ _id: { "$oid": id } });
    if (getUser) {
      const userFound: User = getUser;
      return c.json(userFound, 200);
    }
    throw new ErrorHandler("User not found", 404);
  } catch (error) {
    throw new ErrorHandler(error.message, error.status || 500);
  }
};

// update User
export const updateUser: HandlerFunc = async (c: Context) => {
  try {

    const { id } = c.params as { id: string };
    const { updatepassword } = c.queryParams as {updatepassword: string };
    
    if (c.request.headers.get("content-type") !== "application/json") {
      throw new ErrorHandler("Invalid body", 422);
    }

    var _updatePassword:boolean =  false;

    if(updatepassword == undefined || updatepassword == "true"){
      _updatePassword = true;
    }

    const body: any = await c.body as {
      name: string;
      username: string;
      email: string;
      password: string;
      tokenfcm: string[];
      imgurl: string;
      role: Role;
    };

    if (!Object.keys(body).length) {
      throw new ErrorHandler("Request body can not be empty!", 400);
    }
    const userFound = await users.findOne({ _id: { "$oid": id } });
    if (userFound) {

      // Encrypt new password 
      if(_updatePassword){
        const encryptPassword = await bcrypt.hash(body.password);
        body.password = encryptPassword;
      }

      const { matchedCount } = await users.updateOne(
        { _id: { "$oid": id } },
        { $set: body },
      );
      if (matchedCount) {
        return c.json({message: "User updated successfully!"});
      }
      return c.json({message: "Unable to update user"});
    }
    throw new ErrorHandler("User not found", 404);
  } catch (error) {
    throw new ErrorHandler(error.message, error.status || 500);
  }
};

// delete User
export const deleteUser: HandlerFunc = async (c: Context) => {
  try {
    const { id } = c.params as { id: string };
    const getUser: any = await users.findOne({ _id: { "$oid": id } });
    if (getUser) {
      const deleteCount = await users.deleteOne({ _id: { "$oid": id } });
      if (deleteCount) {
        return c.json({message: "User deleted successfully!"});
      }
      throw new ErrorHandler("Unable to delete user", 400);
    }
    throw new ErrorHandler("User not found", 404);
  } catch (error) {
    throw new ErrorHandler(error.message, error.status || 500);
  }
};

// login
export const loginUser: HandlerFunc = async (c: Context) => {
  try {
    const body: any = await c.body;
    const { email, password } = body;

    const getUser: any = await users.findOne({ email: email });

    if (getUser) {
      const userFound: User = getUser;
      const result = await bcrypt.compare(password, userFound.password);
      console.log(password);
      console.log(userFound.password);
      if(result){
        c.params = {
          id: userFound._id.$oid, 
          username: userFound.username
        };

        return await generateJWT(c);
      } 

      throw new ErrorHandler("The username or password are not correct", 404);
    }
    throw new ErrorHandler("User not found", 404);
  } catch (error) {
    throw new ErrorHandler(error.message, error.status || 500);
  }
};