export class Spherical {

    private static instance: Spherical;
    private static EARTH_RADIUS: number = 6371009;

    private constructor(){

    }

    static getInstance() {
        if(!Spherical.instance){
            Spherical.instance = new Spherical();
        }
        return Spherical.instance;
    }

    private toRadians(d) {
        return d * Math.PI / 180;
    }

    /**
     * Returns haversine(angle-in-radians).
     * hav(x) == (1 - cos(x)) / 2 == sin(x / 2)^2.
     */
    private hav(x) {
        var sinHalf = Math.sin(x * 0.5);
        return sinHalf * sinHalf;
    }

    /**
     * Computes inverse haversine. Has good numerical stability around 0.
     * arcHav(x) == acos(1 - 2 * x) == 2 * asin(sqrt(x)).
     * The argument must be in [0, 1], and the result is positive.
     */
    private arcHav(x) {
        return 2 * Math.asin(Math.sqrt(x));
    }

    /**
     * Returns hav() of distance from (lat1, lng1) to (lat2, lng2) on the unit sphere.
     */
    private havDistance(lat1, lat2, dLng) {
        return this.hav(lat1 - lat2) + this.hav(dLng) * Math.cos(lat1) * Math.cos(lat2);
    }

    /**
     * Returns distance on the unit sphere; the arguments are in radians.
     */
    private distanceRadians(lat1, lng1, lat2, lng2) {
        return this.arcHav(this.havDistance(lat1, lat2, lng1 - lng2));
    }

    /**
     * Returns the angle between two LatLngs, in radians. This is the same as the distance
     * on the unit sphere.
     */
    private computeAngleBetween(from, to) {
        return this.distanceRadians(this.toRadians(from.lat), this.toRadians(from.lng),
                            this.toRadians(to.lat), this.toRadians(to.lng));
    }

    /**
     * Returns the distance between two LatLngs, in meters.
     */
    public static computeDistanceBetween(from, to): number {
        //var spherical = this.getInstance();
        return this.getInstance().computeAngleBetween(from, to) * Spherical.EARTH_RADIUS;
    }
}