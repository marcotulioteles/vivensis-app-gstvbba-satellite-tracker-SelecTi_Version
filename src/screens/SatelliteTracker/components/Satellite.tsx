import React from 'react';
import { Image } from 'react-native';
import { SATELLITE_HEIGHT, SATELLITE_WIDTH } from '../constants/satellite-tracker.const';

interface SatelliteProps {
  satelliteX: number;
  satelliteY: number;
  isVisible: boolean;
}

export const Satellite: React.FC<SatelliteProps> = ({ satelliteX, satelliteY, isVisible }) => {
  return (
    <Image
      source={require('../../../assets/images/satelite.png')}
      style={{
        position: 'absolute',
        left: satelliteX,
        top: satelliteY,
        width: SATELLITE_WIDTH,
        height: SATELLITE_HEIGHT,
        resizeMode: 'contain',
        opacity: isVisible ? 1 : 0
      }}
    />
  );
};
