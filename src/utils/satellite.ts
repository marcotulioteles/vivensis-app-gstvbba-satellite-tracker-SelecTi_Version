import * as satellite from 'satellite.js'
import { Platform } from 'react-native'

interface MagnetometerData {
  x: number
  y: number
  z: number
}

interface AccelerometerData {
  x: number
  y: number
  z: number
}

interface SatellitePosition {
  azimuth: number
  elevation: number
}

interface DeviceOrientation {
  elevation: number
}

interface DirectionProps {
  magnetometerData?: MagnetometerData | null
  accelerometerData?: AccelerometerData | null
  satellitePosition: SatellitePosition
  deviceOrientation: DeviceOrientation
  azimuth: number | null
}

interface DirectionResult {
  vertical: string | null
  horizontal: string | null
}

interface SatellitePosition {
  azimuth: number
  elevation: number
}

interface DeviceOrientation {
  elevation: number
}

interface BackgroundColorProps {
  satellitePosition: SatellitePosition
  deviceOrientation: DeviceOrientation
  azimuth?: number
}

export const calculateSatellitePosition = (
  latitude: number,
  longitude: number,
  tleLine1: string,
  tleLine2: string,
  setSatellitePosition: (position: { azimuth: number; elevation: number }) => void
) => {
  const observerGd = {
    latitude: satellite.degreesToRadians(latitude),
    longitude: satellite.degreesToRadians(longitude),
    height: 0.8,
  }

  const satelliteRecord: any = satellite.twoline2satrec(tleLine1, tleLine2)
  const positionAndVelocity: any = satellite.propagate(satelliteRecord, new Date())

  if (positionAndVelocity.position && positionAndVelocity.velocity) {
    const gmst: any = satellite.gstime(new Date())
    const positionEcf: any = satellite.eciToEcf(positionAndVelocity.position, gmst)

    const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf)

    const azimuth = satellite.radiansToDegrees(lookAngles.azimuth)
    const elevation = satellite.radiansToDegrees(lookAngles.elevation)

    setSatellitePosition({ azimuth, elevation })
  }
}

export const calculateSatellitePositionRA = async (
  latitude: number,
  longitude: number,
  tleLine1: string,
  tleLine2: string,
  setSatellitePosition: (position: { azimuth: number; elevation: number }) => void
) => {
  const observerGd = {
    latitude: satellite.degreesToRadians(latitude),
    longitude: satellite.degreesToRadians(longitude),
    height: 0.8,
  }

  const satelliteRecord: any = satellite.twoline2satrec(tleLine1, tleLine2)
  const positionAndVelocity: any = satellite.propagate(satelliteRecord, new Date())

  if (positionAndVelocity.position && positionAndVelocity.velocity) {
    const gmst: any = satellite.gstime(new Date())
    const positionEcf: any = satellite.eciToEcf(positionAndVelocity.position, gmst)

    const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf)

    const azimuth = satellite.radiansToDegrees(lookAngles.azimuth)
    const elevation = satellite.radiansToDegrees(lookAngles.elevation)

    setSatellitePosition({ azimuth, elevation })
  }
}

export const checkHorizontalInclination = (
  accelerometerData: { x: number },
  setHorizontalInstruction: (instruction: string | null) => void
) => {
  const { x } = accelerometerData
  const inclinationThreshold = 0.342 // controla os graus para saber se tá na vertical aqui são 20 graus

  if (Math.abs(x) > inclinationThreshold) {
    setHorizontalInstruction(x > 0 ? 'Incline para a direita' : 'Incline para a esquerda')
  } else {
    setHorizontalInstruction(null)
  }
}

export const isDeviceVertical = (accelerometerData: any) => {
  const { x, y, z } = accelerometerData
  const pitch = Math.atan2(x, Math.sqrt(y * y + z * z)) * (180 / Math.PI)
  return Math.abs(pitch) < 80
}

export const calculateAzimuth = (
  magnetometer: { x: number; y: number; z: number } | null,
  accelerometer: { x: number; y: number; z: number } | null,
  isForNumber?: boolean
): number | undefined => {
  if (!magnetometer || !accelerometer) return

  const { x: mx, y: my, z: mz } = magnetometer
  const { x: ax, y: ay, z: az } = accelerometer

  const normA = Math.sqrt(ax * ax + ay * ay + az * az)
  const axn = ax / normA
  const ayn = ay / normA
  const azn = az / normA

  const ex = my * azn - mz * ayn
  const ey = mz * axn - mx * azn
  const ez = mx * ayn - my * axn

  const normE = Math.sqrt(ex * ex + ey * ey + ez * ez)
  const exn = ex / normE
  const eyn = ey / normE

  let azimuth = Math.atan2(eyn, exn) * (180 / Math.PI)
  if (azimuth < 0) {
    azimuth += 360
  }

  if (Platform.OS === 'ios') {
    azimuth = (360 - azimuth) % 360 // Correct the direction inversion on iOS
    azimuth = (azimuth + 180) % 360
  } else {
    azimuth = 360 - azimuth - 15 // Keep original logic for Android
  }

  if (azimuth < 0) {
    azimuth += 360
  } else if (azimuth >= 360) {
    azimuth -= 360
  }

  if (isForNumber) {
    let azimuthForNumber = Math.atan2(eyn, exn) * (180 / Math.PI)
    if (azimuthForNumber < 0) {
      azimuthForNumber += 360
    }

    if (Platform.OS === 'ios') {
      azimuthForNumber = (360 - azimuthForNumber) % 360
      azimuthForNumber = (azimuthForNumber + 180) % 360
    } else {
      azimuthForNumber = 360 - azimuthForNumber - 15 // Keep original logic for Android
    }

    if (azimuthForNumber < 0) {
      azimuthForNumber += 360
    } else if (azimuthForNumber >= 360) {
      azimuthForNumber -= 360
    }

    return azimuthForNumber
  }

  return azimuth
}

export const getDirection = ({
  azimuth,
  satellitePosition,
  deviceOrientation,
}: DirectionProps): DirectionResult => {
  if (!azimuth) return { vertical: null, horizontal: null }
  const { azimuth: satAzimuth, elevation: satElevation } = satellitePosition
  const { elevation: devElevation } = deviceOrientation

  let deltaAzimuth = satAzimuth - azimuth
  const deltaElevation = satElevation - devElevation

  if (deltaAzimuth > 180) {
    deltaAzimuth -= 360
  } else if (deltaAzimuth < -180) {
    deltaAzimuth += 360
  }

  const azimuthThreshold = 15
  const elevationThreshold = 10

  let verticalDirection: string | null = null
  let horizontalDirection: string | null = null

  if (Math.abs(deltaElevation) > elevationThreshold) {
    verticalDirection = deltaElevation > 0 ? 'up' : 'down'
  }

  if (Math.abs(deltaAzimuth) > azimuthThreshold) {
    horizontalDirection = deltaAzimuth > 0 ? 'right' : 'left'
  }

  return { vertical: verticalDirection, horizontal: horizontalDirection }
}

export const getBackgroundColor = ({
  satellitePosition,
  deviceOrientation,
  azimuth = 0,
}: BackgroundColorProps): string => {
  const { azimuth: satAzimuth, elevation: satElevation } = satellitePosition
  const { elevation: devElevation } = deviceOrientation

  let deltaAzimuth = satAzimuth - azimuth
  const deltaElevation = satElevation - devElevation

  if (deltaAzimuth > 180) {
    deltaAzimuth -= 360
  } else if (deltaAzimuth < -180) {
    deltaAzimuth += 360
  }

  const azimuthThreshold = 14
  const elevationThreshold = 9
  const azimuthWarningThreshold = 49
  const elevationWarningThreshold = 39

  if (
    Math.abs(deltaAzimuth) <= azimuthWarningThreshold &&
    Math.abs(deltaElevation) <= elevationWarningThreshold
  ) {
    if (
      Math.abs(deltaAzimuth) <= azimuthThreshold &&
      Math.abs(deltaElevation) <= elevationThreshold
    ) {
      return 'success'
    }
    return 'warning'
  }
  return 'default'
}

export function getRotationMatrix(accelerometer: any, magnetometer: any) {
  const Ax = accelerometer.x
  const Ay = accelerometer.y
  const Az = accelerometer.z

  const Ex = magnetometer.x
  const Ey = magnetometer.y
  const Ez = magnetometer.z

  const normA = Math.sqrt(Ax * Ax + Ay * Ay + Az * Az)
  const ax = Ax / normA
  const ay = Ay / normA
  const az = Az / normA

  const normM = Math.sqrt(Ex * Ex + Ey * Ey + Ez * Ez)
  const mx = Ex / normM
  const my = Ey / normM
  const mz = Ez / normM

  const hx = my * az - mz * ay
  const hy = mz * ax - mx * az
  const hz = mx * ay - my * ax

  const normH = Math.sqrt(hx * hx + hy * hy + hz * hz)
  if (normH < 0.1) {
    return null
  }

  const invH = 1.0 / normH
  const Hx = hx * invH
  const Hy = hy * invH
  const Hz = hz * invH

  const Mx = ay * Hz - az * Hy
  const My = az * Hx - ax * Hz
  const Mz = ax * Hy - ay * Hx

  const R = [
    [Hx, Hy, Hz],
    [Mx, My, Mz],
    [ax, ay, az],
  ]

  return R
}

export function getOrientation(R: any) {
  let azimuth, pitch, roll

  if (R != null) {
    const sinPitch = -R[2][0]
    pitch = Math.asin(sinPitch)

    const cosPitch = Math.cos(pitch)

    if (Math.abs(cosPitch) > 0.0001) {
      roll = Math.atan2(R[2][1], R[2][2])
      azimuth = Math.atan2(R[1][0], R[0][0])
    } else {
      roll = 0
      azimuth = Math.atan2(-R[0][1], R[1][1])
    }
  } else {
    azimuth = 0
    pitch = 0
    roll = 0
  }

  return { azimuth, pitch, roll }
}
