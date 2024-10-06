import React, { useEffect, useRef, useState } from 'react';
import { View, Dimensions, Platform, PermissionsAndroid } from 'react-native';
import Geolocation, { GeoCoordinates } from 'react-native-geolocation-service';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateSatellitePosition } from '~/utils/satellite';
import { Camera } from 'expo-camera';
import { useDeviceMotion } from './hooks/useDeviceMotion';
import { Radar } from './components/Radar';
import { Satellite } from './components/Satellite';
import { GuidanceArrows } from './components/GuidanceArrows';
import geomagnetism from 'geomagnetism'
import * as Location from 'expo-location'
import { normalize } from '~/utils';
import { CameraTrackerFooter } from './components/CameraTrackerFooter';
import { calculateSatelliteStatus } from './utils/calculate-satellite-status.util';

export const SatelliteTrackerCamera: React.FC = () => {
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [satellitePosition, setSatellitePosition] = useState({ azimuth: 0, elevation: 0 });
  const { width, height } = Dimensions.get('window')
  const [loading, setLoading] = useState(true)
  const [declination, setDeclination] = useState(0);
  const cameraHeight = height * 0.89 - normalize(90)
  const [viewSize, setViewSize] = useState({ width, height: cameraHeight })

  const getDeclination = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      console.log('Permissão de localização negada')
      return
    }
  
    let location = await Location.getCurrentPositionAsync({})
    const { latitude, longitude } = location.coords
  
    const magneticModel = geomagnetism.model()
    const geoData = magneticModel.point([latitude, longitude])
    return geoData.decl;
  }

  useEffect(() => {
    if (satellitePosition?.elevation !== 0) {
      return;
    }
  
    let watchId: any = null;
  
    const requestPermissionsAndLocation = async () => {
      try {
        const locationGranted = await requestLocationPermission();
        if (!locationGranted) {
          setLoading(false);
          return;
        }
  
        const [declination, isConnected] = await Promise.all([
          getDeclination(),
          NetInfo.fetch().then(state => state.isConnected),
        ]);
  
        setDeclination(declination);
        setHasLocationPermission(locationGranted);
  
        if (isConnected) {
          await handleCurrentPosition();
        } else {
          await handleWatchPosition();
        }
      } catch (error) {
        console.error('Error requesting permissions or getting location:', error);
        setLoading(false);
      }
    };
  
    const requestLocationPermission = async () => {
      if (Platform.OS === 'ios') {
        const locationStatus = await Geolocation.requestAuthorization('whenInUse');
        return locationStatus === 'granted';
      } else if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return false;
    };
  
    const handleCurrentPosition = async () => {
      Geolocation.getCurrentPosition(
        async (position) => {
          await savePosition(position.coords);
          calculateSatellitePosition(
            position.coords.latitude,
            position.coords.longitude,
            '1 40733U 15034B   24175.36725698 -.00000252  00000+0  00000+0 0  9993',
            '2 40733   0.0230  20.1780 0002189  50.1079 263.9484  1.00270215 32766',
            setSatellitePosition
          );
          setLoading(false);
        },
        (error) => {
          console.error('Error getting current position:', error);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 10000,
        }
      );
    };
  
    const handleWatchPosition = async () => {
      watchId = Geolocation.watchPosition(
        async (position) => {
          await savePosition(position.coords);
          calculateSatellitePosition(
            position.coords.latitude,
            position.coords.longitude,
            '1 40733U 15034B   24175.36725698 -.00000252  00000+0  00000+0 0  9993',
            '2 40733   0.0230  20.1780 0002189  50.1079 263.9484  1.00270215 32766',
            setSatellitePosition
          );
        },
        async (error) => {
          console.error('Error watching position:', error);
          const lastPosition = await AsyncStorage.getItem('lastPosition');
          if (lastPosition) {
            const coords = JSON.parse(lastPosition);
            calculateSatellitePosition(
              coords.latitude,
              coords.longitude,
              '1 40733U 15034B   24175.36725698 -.00000252  00000+0  00000+0 0  9993',
              '2 40733   0.0230  20.1780 0002189  50.1079 263.9484  1.00270215 32766',
              setSatellitePosition
            );
          }
        },
        {
          enableHighAccuracy: false,
          distanceFilter: 0,
        }
      );
    };
  
    const savePosition = async (coords: GeoCoordinates) => {
      await AsyncStorage.setItem('lastPosition', JSON.stringify(coords));
    };
  
    requestPermissionsAndLocation();
  
    return () => {
      if (watchId) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, [satellitePosition?.elevation]);

  const { azimuth, elevation } = useDeviceMotion();

  const viewRef = useRef<View>(null)
  const onLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout
    setViewSize({ width, height })
  }

  const { 
    radarX, 
    radarY, 
    satelliteProximityStatus, 
    satelliteX, 
    satelliteY, 
    isSatelliteVisible, 
    azimuthDiff, 
    elevationDiff
  } = calculateSatelliteStatus(
    satellitePosition,
    azimuth,
    elevation,
    screenWidth,
    screenHeight,
    Date.now()
  );
  
  return (
    <View style={{ flex: 1 }}>
      <Camera style={{ flex: 1 }}>
        <Radar radarX={radarX} radarY={radarY} satelliteProximityStatus={satelliteProximityStatus} />
      </Camera>
      <Satellite satelliteX={satelliteX} satelliteY={satelliteY} isVisible={isSatelliteVisible} />
      <GuidanceArrows
        azimuthDiff={azimuthDiff} 
        elevationDiff={elevationDiff} 
        isSatelliteVisible={isSatelliteVisible} 
        screenHeight={screenHeight} 
        screenWidth={screenWidth}
      />
      <CameraTrackerFooter
        azimuth={azimuth}
        elevation={elevation}
        onLayout={onLayout}
        satelliteAzimuth={satellitePosition.azimuth}
        satelliteElevation={satellitePosition.elevation}
        viewRef={viewRef}
      />
    </View>
  );
};