// Conversión Lat/Lon → UTM — espejo exacto de LocationUtils.kt del Android
// Datum: WGS84, Zona UTM automática según longitud

const SEMI_MAJOR = 6378137.0;
const FLATTENING = 1 / 298.257223563;
const SEMI_MINOR = SEMI_MAJOR * (1 - FLATTENING);
const E2 = 1 - (SEMI_MINOR * SEMI_MINOR) / (SEMI_MAJOR * SEMI_MAJOR);
const E_PRIME2 = E2 / (1 - E2);
const K0 = 0.9996;

export interface UTMCoords {
    x: string; // Easting  (coordenadaX)
    y: string; // Northing (coordenadaY)
    zone: number;
    hemisphere: "N" | "S";
}

export function latLonToUTM(lat: number, lon: number): UTMCoords {
    const zone = Math.floor((lon + 180) / 6) + 1;
    const lonOrigin = (zone - 1) * 6 - 180 + 3;

    const latRad = (lat * Math.PI) / 180;
    const lonRad = (lon * Math.PI) / 180;
    const lonOriginRad = (lonOrigin * Math.PI) / 180;

    const N = SEMI_MAJOR / Math.sqrt(1 - E2 * Math.sin(latRad) ** 2);
    const T = Math.tan(latRad) ** 2;
    const C = E_PRIME2 * Math.cos(latRad) ** 2;
    const A = Math.cos(latRad) * (lonRad - lonOriginRad);

    const M =
        SEMI_MAJOR *
        ((1 - E2 / 4 - (3 * E2 ** 2) / 64 - (5 * E2 ** 3) / 256) * latRad -
            ((3 * E2) / 8 + (3 * E2 ** 2) / 32 + (45 * E2 ** 3) / 1024) * Math.sin(2 * latRad) +
            ((15 * E2 ** 2) / 256 + (45 * E2 ** 3) / 1024) * Math.sin(4 * latRad) -
            ((35 * E2 ** 3) / 3072) * Math.sin(6 * latRad));

    const easting =
        K0 *
        N *
        (A +
            ((1 - T + C) * A ** 3) / 6 +
            ((5 - 18 * T + T ** 2 + 72 * C - 58 * E_PRIME2) * A ** 5) / 120) +
        500000;

    let northing =
        K0 *
        (M +
            N *
            Math.tan(latRad) *
            (A ** 2 / 2 +
                ((5 - T + 9 * C + 4 * C ** 2) * A ** 4) / 24 +
                ((61 - 58 * T + T ** 2 + 600 * C - 330 * E_PRIME2) * A ** 6) / 720));

    // Hemisferio sur: offset de 10.000.000m
    if (lat < 0) northing += 10000000;

    return {
        x: easting.toFixed(2),
        y: northing.toFixed(2),
        zone,
        hemisphere: lat >= 0 ? "N" : "S",
    };
}