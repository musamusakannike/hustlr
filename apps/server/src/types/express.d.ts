import type { Document } from "mongoose";
import type { IUser } from "../models/user.model";
import type { IBuyerProfile } from "../models/buyer-profile.model";
import type { IStore } from "../models/store.model";

declare global {
  namespace Express {
    interface Request {
      user?: IUser & Document;
      buyer?: IBuyerProfile & Document;
      store?: IStore & Document;
      rawBody?: Buffer;
      file?: Express.Multer.File;
      files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
    }
  }
}

export {};
