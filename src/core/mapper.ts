import { Enums } from "../enums/enums";

export class Mapper {

    private static instance: Mapper;

    private constructor(){

    }

    static getInstance() {
        if(!Mapper.instance){
            Mapper.instance = new Mapper();
        }
        return Mapper.instance;
    }


    /**
     * Maps end point status to app status
     * 
     * @param {string} status 
     * @returns {Enums.ParkingStatus} 
     * @memberof Mapper
     */
    public static mapStatus(status: string): Enums.ParkingStatus {

        var parkingStatus: Enums.ParkingStatus = Enums.ParkingStatus.Unknown;
        switch(status){
            case "status_1": 
                parkingStatus = Enums.ParkingStatus.Open;
                break;
            case "status_2": 
                parkingStatus = Enums.ParkingStatus.Full;
                break;
            case "status_3": 
                parkingStatus = Enums.ParkingStatus.Unavailable;
                break;
            case "status_4": 
                parkingStatus = Enums.ParkingStatus.Closed;
                break;
            default:
                parkingStatus = Enums.ParkingStatus.Unknown;
                break;
        }

        return parkingStatus;
    }
    

    /**
     * Maps end point parking type to app type
     * 
     * @static
     * @param {string} type 
     * @returns {Enums.ParkingType} 
     * @memberof Mapper
     */
    public static mapParkingType(type: string): Enums.ParkingType{

        var parkingType: Enums.ParkingType = Enums.ParkingType.Unknown;

        switch(type){
            case "parking": 
                parkingType = Enums.ParkingType.Parking;
                break;
            default:
                parkingType = Enums.ParkingType.Unknown;
                break;
        }

        return parkingType;
    }
}