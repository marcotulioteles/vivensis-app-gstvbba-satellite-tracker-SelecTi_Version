import React, { useEffect, useRef } from 'react';
import { View, Image, Text, Dimensions } from 'react-native';
import { RADAR_WIDTH, RADAR_HEIGHT } from '../constants/satellite-tracker.const';
import { BGCameraSuccess } from '~/assets/svgs';
import { playBeepSound, playSuccessSound, stopSuccessSound } from '../utils/sound.util';
import { Audio } from 'expo-av';

interface RadarProps {
  radarX: number;
  radarY: number;
  satelliteProximityStatus: string;
}

const RADAR_COLOR_MAP = new Map([
  ['warning', '#F9CF3A'],
  ['success', '#68D732'],
  ['default', '#FFFFFF']
]);

const TEXT_COLOR_MAP = new Map([
  ['warning', 'rgba(249, 207, 58, 0.6)'],
  ['success', 'rgba(104, 215, 50, 0.6)'],
  ['default', 'rgba(255, 255, 255, 0.6)']
]);

const TEXT_MAP = new Map([
  ['warning', 'O satélite está próximo!'],
  ['success', 'Satélite localizado!'],
  ['default', '']
]);

export const Radar: React.FC<RadarProps> = ({ radarX, radarY, satelliteProximityStatus }) => {
  const warningIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const successSoundRef = useRef<Audio.Sound | null>(null);
  const beepSoundRef = useRef<Audio.Sound | null>(null);
  const isMounted = useRef(true);

  const handleWarningSound = () => {
    if (warningIntervalRef.current) {
      clearInterval(warningIntervalRef.current);
    }

    warningIntervalRef.current = setInterval(() => {
      if (isMounted.current) {
        playBeepSound(beepSoundRef);
      }
    }, 1000);

    stopSuccessSound(successSoundRef);
  };

  const handleSuccessSound = () => {
    if (warningIntervalRef.current) {
      clearInterval(warningIntervalRef.current);
      warningIntervalRef.current = null;
    }

    playSuccessSound(successSoundRef);
  };

  useEffect(() => {
    if (satelliteProximityStatus === 'warning') {
      handleWarningSound()
    } else if (satelliteProximityStatus === 'success') {
      handleSuccessSound()
    } else {
      if (warningIntervalRef.current) {
        clearInterval(warningIntervalRef.current)
        warningIntervalRef.current = null
      }
      stopSuccessSound(successSoundRef)
    }
  }, [satelliteProximityStatus])

  return (
    <View
      style={{
        position: 'absolute',
        left: radarX,
        top: radarY,
        width: RADAR_WIDTH,
        height: RADAR_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <BGCameraSuccess
        width={Dimensions.get('window').width}
        height={640}
        color={RADAR_COLOR_MAP.get(satelliteProximityStatus)}
        showSuccess={false}
      />
      <View
          style={{
            position: 'absolute',
            top: radarX + 200,
            alignItems: 'center',
            zIndex: 9999999999,
            opacity: satelliteProximityStatus === 'default' ? 0 : 1
          }}
        >
          <Text style={{ fontSize: 16, color: 'white', padding: 10, backgroundColor: TEXT_COLOR_MAP.get(satelliteProximityStatus) }}>
            {TEXT_MAP.get(satelliteProximityStatus)}
          </Text>
        </View>
    </View>
  );
};
