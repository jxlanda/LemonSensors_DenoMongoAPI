import { Context, HandlerFunc, MiddlewareFunc } from "https://deno.land/x/abc@v1.2.0/mod.ts";
import { create } from "https://deno.land/x/djwt@v2.0/mod.ts";
import { verify, getNumericDate } from "https://deno.land/x/djwt@v2.0/mod.ts";

const key = Deno.env.get("SECRET") || "";

export const generateJWT: HandlerFunc = async (c: Context) => {
  const { id, username } = c.params;
  const jwt = await create({ alg: "HS512", typ: "JWT" }, { id: id, username: username, exp: getNumericDate(60 * 60) }, key);
  return c.json({token: jwt});
}

export const validateJWT: HandlerFunc = async (c: Context) => {
    var token = c.params.token;
    try{
      const payload = await verify(token, key, "HS512");
      c.json({ response: "Valid JSON Web Token" });
    }
    catch {
      return c.json({ response: "Invalid JSON Web Token"}, 401);
    }
}

export const jwtAuth: MiddlewareFunc = (next) => async (c) => {
    const url: any = c.url.pathname;
        // Get the token from the request
        const authorization = c.request.headers.get("authorization");

        // Reject request if token was not provide
        if (!authorization) {
            c.response.status = 401;
            return c.json({ message: "Unauthorized" });
        }

        const headerToken = authorization?.replace("Bearer ", "");
        if(headerToken != "ESP32CUEVAS"){
          try{
            const payload = await verify(headerToken, key, "HS512");
          }
          catch {
            c.response.status = 401;
            return c.json({ message: "Wrong Token" });
          }
        }
    
    // JWT is correct, so continue and call the private route
    await next(c);
};
