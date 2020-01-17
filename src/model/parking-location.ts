import { TGeoPosition } from "../types/custom-type";
import { Enums } from "../enums/enums";

export class ParkingLocation {

    private _id: number;
    private _name: string;
    private _position: TGeoPosition;
    private _parkingType: string = Enums.ParkingType[Enums.ParkingType.Parking];
  
    constructor(id: number, name: string, position: TGeoPosition, parkingType: string ){
      this._id = id;
      this._name = name;
      this._position = position;
      this._parkingType = parkingType;
    }

    public get id(): number{
      return this._id;
    }

    public set id(value: number){
        this._id = value;
    }

    public get name(): string{
        return this._name;
    }

    public set name(value: string){
        this._name = value;
    }

    public get position(): TGeoPosition{
      return this._position;
    }

    public set position(value: TGeoPosition){
        this._position = value;
    }

    public get parkingType(): string{
      return this._parkingType;
    }

    public set parkingType(value: string){
        this._parkingType = value;
    }
}