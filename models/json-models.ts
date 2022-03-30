// User
export interface User {
    _id: {
      $oid: string;
    };
    name: string;
    username: string;
    email: string;
    password: string;
    imgurl:string;
    tokensfcm: string[];
    role: Role;
}
  
export interface Role {
    id: number;
    name: string;
}

// Sensor
export interface Sensor {
  _id: {
    $oid: string;
  };
  name: string;
  description: string;
  brand: string;
  model: string;
  category: string;
  measurement: string;
  minvoltage: number;
  maxvoltage: number;
  storageplace: string;
  config: Config;
  user: UserMinimal
}

export interface UserMinimal {
  id: string;
  username: string;
  email: string;
  imgurl:string;
}

export interface SensorMinimal {
  id: string;
  name: string;
  model: string;
  measurement: string;
  storageplace: string;
  sensinginseconds: number;
  minvalue: number;
  maxvalue: number;
}

export interface Config {
  sensinginseconds: number;
  minvalue: number;
  maxvalue: number;
}

export interface History {
  _id: {
    $oid: string;
  };
  sensor: SensorMinimal;
  user: UserMinimal;
  value: number;
  datetime: Date;
  isEvent: boolean; 
}
