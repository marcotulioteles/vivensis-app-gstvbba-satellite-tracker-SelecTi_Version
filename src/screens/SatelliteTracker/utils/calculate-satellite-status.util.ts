import { getBackgroundColor } from "~/utils/satellite";
import { normalizeDifference } from "./satellite-tracker.utils";
import { ALIGNMENT_THRESHOLD, AZIMUTH_THRESHOLD, ELEVATION_THRESHOLD, RADAR_HEIGHT, RADAR_WIDTH, SATELLITE_HEIGHT, SATELLITE_WIDTH } from '../constants/satellite-tracker.const';

let previousAzimuth: number | null = null;
let previousElevation: number | null = null;
let previousTimestamp: number | null = null;
const MOVEMENT_THRESHOLD = 100;
const PROXIMITY_THRESHOLD = 20;

export const calculateSatelliteStatus = (
  satellitePosition: { azimuth: number, elevation: number }, 
  azimuth: number, 
  elevation: number, 
  screenWidth: number, 
  screenHeight: number, 
  currentTimestamp: number
) => {
  const azimuthDiff = normalizeDifference(satellitePosition.azimuth - azimuth);
  const elevationDiff = normalizeDifference(satellitePosition.elevation - elevation);

  let movementSpeed = 0;
  if (previousAzimuth !== null && previousElevation !== null && previousTimestamp !== null) {
    const timeDiff = (currentTimestamp - previousTimestamp) / 1000;
    const azimuthSpeed = Math.abs(azimuth - previousAzimuth) / timeDiff;
    const elevationSpeed = Math.abs(elevation - previousElevation) / timeDiff;
    movementSpeed = Math.max(azimuthSpeed, elevationSpeed);
  }

  previousAzimuth = azimuth;
  previousElevation = elevation;
  previousTimestamp = currentTimestamp;

  const isMovingTooFast = movementSpeed > MOVEMENT_THRESHOLD;

  const radarX = (screenWidth - RADAR_WIDTH) / 2;
  const radarY = (screenHeight - RADAR_HEIGHT) / 2;
  const satelliteInitialX = (screenWidth - SATELLITE_WIDTH) / 2;
  const satelliteInitialY = (screenHeight - SATELLITE_HEIGHT) / 2;

  const satelliteTranslateX = (azimuthDiff / AZIMUTH_THRESHOLD) * (screenWidth / 2);
  const satelliteTranslateY = (elevationDiff / ELEVATION_THRESHOLD) * (screenHeight / 2);
  
  const satelliteX = satelliteInitialX + satelliteTranslateX;
  const satelliteY = satelliteInitialY + satelliteTranslateY;

  const satelliteProximityStatus = getBackgroundColor({ 
    satellitePosition, 
    deviceOrientation: { elevation }, 
    azimuth 
  });

  const isWithinProximity = Math.abs(azimuthDiff) <= PROXIMITY_THRESHOLD ||
                            Math.abs(elevationDiff) <= PROXIMITY_THRESHOLD;

  const isSatelliteVisible = isWithinProximity && !isMovingTooFast && satelliteProximityStatus === 'success';
  const isSatelliteAligned = Math.abs(azimuthDiff) <= ALIGNMENT_THRESHOLD &&
                             Math.abs(elevationDiff) <= ALIGNMENT_THRESHOLD && satelliteProximityStatus === 'success';

  return {
    azimuthDiff,
    elevationDiff,
    satelliteX,
    satelliteY,
    radarX,
    radarY,
    isSatelliteVisible,
    isSatelliteAligned,
    satelliteProximityStatus,
    isMovingTooFast,
  };
};
