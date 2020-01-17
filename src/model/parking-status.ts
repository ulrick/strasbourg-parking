export class ParkingStatus {

    private _id: number;
    private _status: string;
    private _nbAvailablePlaces: number;
    private _nbTotalPlaces: number;

    constructor(id: number, status: string, availablePlaces: number, totalPlaces: number){
        this._id = id;
        this._status = status;
        this._nbAvailablePlaces = availablePlaces;
        this._nbTotalPlaces = totalPlaces;
    }

    public get id(): number{
        return this._id;
    }

    public set id(value: number){
        this._id = value;
    }

    public get status(): string{
        return this._status;
    }

    public set status(value: string){
        this._status = value;
    }

    public get nbAvailablePlaces(): number{
        return this._nbAvailablePlaces;
    }

    public set nbAvailablePlaces(value: number){
        this._nbAvailablePlaces = value;
    }

    public get nbTotalPlaces(): number{
        return this._nbTotalPlaces;
    }

    public set nbTotalPlaces(value: number){
        this._nbTotalPlaces = value;
    }
    
}