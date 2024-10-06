import { useState, useEffect, useRef } from 'react';
import { Magnetometer, Accelerometer, DeviceMotion } from 'expo-sensors';
import * as Location from 'expo-location';
import geomagnetism from 'geomagnetism';
import { ALPHA_SMOOTHING_FACTOR } from '../constants/satellite-tracker.const';

export const useDeviceMotion = (alpha: number = ALPHA_SMOOTHING_FACTOR) => {
  const [azimuth, setAzimuth] = useState(0);
  const [elevation, setElevation] = useState(0);
  const [declination, setDeclination] = useState(0);

  const latestMagnetometerDataRef = useRef<any>(null);
  const latestAccelerometerDataRef = useRef<any>(null);

  const getMagneticDeclination = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        alert('Permission to access location is required to apply magnetic declination.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const magneticModel = geomagnetism.model();
      const geoData = magneticModel.point([latitude, longitude]);
      setDeclination(geoData.decl);
    } catch (error) {
      console.error('Error getting magnetic declination:', error);
    }
  };

  const calculateAzimuth = () => {
    const accelerometerN = latestAccelerometerDataRef.current;
    const magnetometerN = latestMagnetometerDataRef.current;
    if (accelerometerN && magnetometerN) {
      let ax = accelerometerN.x;
      let ay = accelerometerN.y;
      let az = accelerometerN.z;

      let mx = magnetometerN.x;
      let my = magnetometerN.y;
      let mz = magnetometerN.z;

      const R = getRotationMatrix({ x: ax, y: ay, z: az }, { x: mx, y: my, z: mz });
      if (R == null) {
        return;
      }

      const { azimuth } = getOrientation(R);

      let azimuthDeg = (azimuth * 180) / Math.PI;
      azimuthDeg = (azimuthDeg + 360) % 360;

      azimuthDeg = (360 - azimuthDeg) % 360;

      azimuthDeg += declination;
      azimuthDeg = (azimuthDeg + 360) % 360;

      setAzimuth((prev) => prev + alpha * (azimuthDeg - prev));
    }
  };

  const calculateElevation = (data: any) => {
    if (data.rotation) {
      const { beta } = data.rotation;
      let pitchDeg = (beta * 180) / Math.PI;

      setElevation((prev) => prev + alpha * (pitchDeg - prev));
    }
  };

  useEffect(() => {
    getMagneticDeclination();

    Accelerometer.setUpdateInterval(100);
    Magnetometer.setUpdateInterval(100);

    const magnetometerSubscription = Magnetometer.addListener((data) => {
      latestMagnetometerDataRef.current = data;
    });

    const accelerometerSubscription = Accelerometer.addListener((data) => {
      latestAccelerometerDataRef.current = data;
    });

    const deviceMotionSubscription = DeviceMotion.addListener((data) => {
      calculateElevation(data);
    });

    DeviceMotion.setUpdateInterval(100);

    const intervalId = setInterval(() => {
      calculateAzimuth();
    }, 100);

    return () => {
      magnetometerSubscription.remove();
      accelerometerSubscription.remove();
      deviceMotionSubscription.remove();
      clearInterval(intervalId);
    };
  }, [alpha]);

  return { azimuth, elevation };
};

function getRotationMatrix(accelerometer: any, magnetometer: any) {
  const Ax = accelerometer.x;
  const Ay = accelerometer.y;
  const Az = accelerometer.z;

  const Ex = magnetometer.x;
  const Ey = magnetometer.y;
  const Ez = magnetometer.z;

  const normA = Math.sqrt(Ax * Ax + Ay * Ay + Az * Az);
  const ax = Ax / normA;
  const ay = Ay / normA;
  const az = Az / normA;

  const normM = Math.sqrt(Ex * Ex + Ey * Ey + Ez * Ez);
  const mx = Ex / normM;
  const my = Ey / normM;
  const mz = Ez / normM;

  const hx = my * az - mz * ay;
  const hy = mz * ax - mx * az;
  const hz = mx * ay - my * ax;

  const normH = Math.sqrt(hx * hx + hy * hy + hz * hz);
  if (normH < 0.1) {
    return null;
  }

  const invH = 1.0 / normH;
  const Hx = hx * invH;
  const Hy = hy * invH;
  const Hz = hz * invH;

  const Mx = ay * Hz - az * Hy;
  const My = az * Hx - ax * Hz;
  const Mz = ax * Hy - ay * Hx;

  const R = [
    [Hx, Hy, Hz],
    [Mx, My, Mz],
    [ax, ay, az],
  ];

  return R;
}

function getOrientation(R: any) {
  let azimuth, pitch, roll;

  if (R != null) {
    const sinPitch = -R[2][0];
    pitch = Math.asin(sinPitch);

    const cosPitch = Math.cos(pitch);

    if (Math.abs(cosPitch) > 0.0001) {
      roll = Math.atan2(R[2][1], R[2][2]);
      azimuth = Math.atan2(R[1][0], R[0][0]);
    } else {
      roll = 0;
      azimuth = Math.atan2(-R[0][1], R[1][1]);
    }
  } else {
    azimuth = 0;
    pitch = 0;
    roll = 0;
  }

  return { azimuth, pitch, roll };
}
