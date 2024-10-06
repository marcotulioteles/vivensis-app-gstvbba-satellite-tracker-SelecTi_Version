import React, { useEffect, useRef, useState } from 'react'
import {
  ViroARSceneNavigator,
  ViroARScene,
  ViroAmbientLight,
  ViroNode,
  Viro3DObject,
  ViroTrackingStateConstants,
  ViroARImageMarker,
  ViroText,
} from '@viro-community/react-viro'
import {
  View,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
  Text,
} from 'react-native'
import { Magnetometer, Accelerometer } from 'expo-sensors'

import * as ScreenOrientation from 'expo-screen-orientation'
import Geolocation from 'react-native-geolocation-service'
import NetInfo from '@react-native-community/netinfo'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { calculateSatellitePosition, getOrientation, getRotationMatrix } from '~/utils/satellite'

// Função para converter radianos para graus
const toDegrees = (radians: number) => radians * (180 / Math.PI)

// Função para converter graus para radianos
const toRadians = (degrees: number) => degrees * (Math.PI / 180)

const calculatePosition = (azimuth: number, elevation: number, radius: number) => {
  const azimuthRad = toRadians(azimuth)
  const elevationRad = toRadians(elevation)

  const x = radius * Math.cos(elevationRad) * Math.sin(azimuthRad)
  const y = radius * Math.sin(elevationRad)
  const z = -radius * Math.cos(elevationRad) * Math.cos(azimuthRad)

  return [x, y, z] as [number, number, number]
}

const SatelliteIcon = require('./res/satellite.obj')

const SENSOR_UPDATE_INTERVAL = 16
const ANIMATION_DURATION = 100
const markerWidth = 70
const markerHeight = 35
const motionThreshold = 0.01
const azimuthThreshold = 2
const elevationThreshold = 1

export const SearchSatelliteRA = () => {
  const [objPosition, setObjPosition] = useState<[number, number, number]>([0, 0, 0])
  const [scale] = useState<[number, number, number]>([0.002, 0.002, 0.002])
  const [trackingInitialized, setTrackingInitialized] = useState(false)

  const [orientation, setOrientation] = useState(ScreenOrientation.Orientation.PORTRAIT_UP)
  const [azimuth, setAzimuth] = useState<number | null>(null)
  const [deviceOrientation, setDeviceOrientation] = useState({ elevation: 0 })
  const latestMagnetometerDataRef = useRef<any>(null)
  const latestAccelerometerDataRef = useRef<any>(null)
  const animationFrameIdRef = useRef<any>(null)
  const previousAzimuthRef = useRef<any>(null)
  const previousElevationRef = useRef<any>(null)

  const [smoothedAzimuth, setSmoothedAzimuth] = useState<number>(0)

  const onTrackingUpdated = (state: number, reason: number) => {
    if (state === 3) {
      console.log({ state, reason })
      // 3 significa que o rastreamento está normal
      setTrackingInitialized(true)
    } else {
      setTrackingInitialized(false)
    }
  }

  const onLoadEnd = () => {
    console.log('Object loaded')
  }

  const [loading, setLoading] = useState(true)
  const [loadingSat, setLoadingSat] = useState(true)
  const [loadingDev, setLoadingDev] = useState(true)
  const [declination, setDeclination] = useState(0)

  const [hasLocationPermission, setHasLocationPermission] = useState(false)
  const [satellitePosition, setSatellitePosition] = useState({ azimuth: 0, elevation: 0 })
  const [deviceAzimuth, setDeviceAzimuth] = useState(0)
  const [adjustedAzimuth, setAdjustedAzimuth] = useState(0)
  const [elevationNew, setElevationNew] = useState(0)

  useEffect(() => {
    if (satellitePosition?.elevation !== 0) {
      return
    }
    let watchId: any = null
    const requestPermissionsAndLocation = async () => {
      let locationGranted = false

      if (Platform.OS === 'ios') {
        const locationStatus = await Geolocation.requestAuthorization('whenInUse')
        locationGranted = locationStatus === 'granted'
      } else if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        )
        locationGranted = granted === PermissionsAndroid.RESULTS.GRANTED
      }

      setHasLocationPermission(locationGranted)

      if (locationGranted) {
        NetInfo.fetch().then(async (state) => {
          if (state.isConnected) {
            Geolocation.getCurrentPosition(
              async (position) => {
                await AsyncStorage.setItem('lastPosition', JSON.stringify(position.coords))
                calculateSatellitePosition(
                  position.coords.latitude,
                  position.coords.longitude,
                  '1 40733U 15034B   24175.36725698 -.00000252  00000+0  00000+0 0  9993',
                  '2 40733   0.0230  20.1780 0002189  50.1079 263.9484  1.00270215 32766',
                  setSatellitePosition
                )
                setTimeout(() => {
                  setLoading(false)
                }, 3000)
              },
              (error) => {
                setTimeout(() => {
                  setLoading(false)
                }, 3000)
              },
              {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 10000,
              }
            )
          } else {
            watchId = Geolocation.watchPosition(
              async (position) => {
                await AsyncStorage.setItem('lastPosition', JSON.stringify(position.coords))
                calculateSatellitePosition(
                  position.coords.latitude,
                  position.coords.longitude,
                  '1 40733U 15034B   24175.36725698 -.00000252  00000+0  00000+0 0  9993',
                  '2 40733   0.0230  20.1780 0002189  50.1079 263.9484  1.00270215 32766',
                  setSatellitePosition
                )
              },
              async (error) => {
                const lastPosition = await AsyncStorage.getItem('lastPosition')
                if (lastPosition) {
                  const coords = JSON.parse(lastPosition)
                  calculateSatellitePosition(
                    coords.latitude,
                    coords.longitude,
                    '1 40733U 15034B   24175.36725698 -.00000252  00000+0  00000+0 0  9993',
                    '2 40733   0.0230  20.1780 0002189  50.1079 263.9484  1.00270215 32766',
                    setSatellitePosition
                  )
                }
              },
              {
                enableHighAccuracy: false,
                distanceFilter: 0,
              }
            )
          }
          setTimeout(() => {
            setLoading(false)
          }, 3000)
        })
      } else {
        setTimeout(() => {
          setLoading(false)
        }, 2000)
      }
    }

    requestPermissionsAndLocation()
    return () => {
      if (watchId) Geolocation.clearWatch(watchId)
    }
  }, [hasLocationPermission, satellitePosition])

  useEffect(() => {
    Accelerometer.setUpdateInterval(SENSOR_UPDATE_INTERVAL)
    Magnetometer.setUpdateInterval(SENSOR_UPDATE_INTERVAL)

    const magnetometerSubscription = Magnetometer.addListener((data) => {
      latestMagnetometerDataRef.current = data
    })

    const accelerometerSubscription = Accelerometer.addListener((data) => {
      latestAccelerometerDataRef.current = data
    })

    const updateMarkerPosition = () => {
      if (latestMagnetometerDataRef.current && latestAccelerometerDataRef.current) {
        if (!azimuth) {
          calculateOrientation()
        }

        animationFrameIdRef.current = requestAnimationFrame(updateMarkerPosition)
      } else {
        animationFrameIdRef.current = requestAnimationFrame(updateMarkerPosition)
      }
    }

    animationFrameIdRef.current = requestAnimationFrame(updateMarkerPosition)
    return () => {
      magnetometerSubscription.remove()
      accelerometerSubscription.remove()
      cancelAnimationFrame(animationFrameIdRef.current)
    }
  }, [satellitePosition])

  const calculateOrientation = () => {
    if (azimuth) return
    const accelerometerN = latestAccelerometerDataRef?.current
    const magnetometerN = latestMagnetometerDataRef?.current
    if (accelerometerN && magnetometerN) {
      let ax = accelerometerN.x
      let ay = accelerometerN.y
      let az = accelerometerN.z

      let mx = magnetometerN.x
      let my = magnetometerN.y
      let mz = magnetometerN.z

      const accelerationMagnitude = Math.sqrt(ax * ax + ay * ay + az * az)

      switch (orientation) {
        case ScreenOrientation.Orientation.PORTRAIT_UP:
          break
        case ScreenOrientation.Orientation.LANDSCAPE_LEFT:
          ;[ax, ay] = [ay, -ax]
          ;[mx, my] = [my, -mx]
          break
        case ScreenOrientation.Orientation.LANDSCAPE_RIGHT:
          ;[ax, ay] = [-ay, ax]
          ;[mx, my] = [-my, mx]
          break
        case ScreenOrientation.Orientation.PORTRAIT_DOWN:
          ax = -ax
          ay = -ay
          mx = -mx
          my = -my
          break
        default:
          break
      }

      const accelerometer = { x: ax, y: ay, z: az }
      const magnetometer = { x: mx, y: my, z: mz }

      const R = getRotationMatrix(accelerometer, magnetometer)
      if (R == null) {
        return
      }

      const { azimuth } = getOrientation(R)

      let azimuthDeg = (azimuth * 180) / Math.PI

      azimuthDeg = (azimuthDeg + 360) % 360

      azimuthDeg = (360 - azimuthDeg) % 360

      azimuthDeg += declination

      azimuthDeg = (azimuthDeg + 360) % 360

      const manualOffset = 20
      azimuthDeg += manualOffset

      azimuthDeg = (azimuthDeg + 360) % 360
      const smoothingFactor = 0.8
      if (
        previousAzimuthRef.current === null ||
        Math.abs(azimuthDeg - previousAzimuthRef.current) > azimuthThreshold
      ) {
        previousAzimuthRef.current = azimuthDeg

        setSmoothedAzimuth(
          (prevAzimuth) => prevAzimuth * smoothingFactor + azimuthDeg * (1 - smoothingFactor)
        )

        const adjustedAzimuthValue = Math.round(azimuthDeg)
        setAdjustedAzimuth(adjustedAzimuthValue)
        const pitchDeg = -Math.atan2(az, Math.sqrt(ax * ax + ay * ay)) * (180 / Math.PI)
        if (
          previousElevationRef.current === null ||
          Math.abs(pitchDeg - previousElevationRef.current) > elevationThreshold
        ) {
          previousElevationRef.current = pitchDeg
          if (accelerationMagnitude < motionThreshold) {
            console.log('Dispositivo parado - congelando a elevação.')
            return
          }
          const elevation =
            Platform.OS === 'ios'
              ? Math.atan2(az, Math.sqrt(ax * ax + ay * ay)) * (180 / Math.PI)
              : Math.atan2(-az, Math.sqrt(ax * ax + ay * ay)) * (180 / Math.PI)
          setDeviceOrientation({ elevation })
          setElevationNew(elevation)
          // setElevationNew(pitchDeg)
        }
        setAzimuth(adjustedAzimuthValue)
      }
    }
  }

  useEffect(() => {
    if (loading || !loadingSat) return
    // const radius = 5 // Distância fixa
    // const position = calculatePosition(
    //   satellitePosition.azimuth,
    //   satellitePosition.elevation,
    //   radius
    // )
    // setObjPosition(position)
    setLoadingSat(false)
  }, [satellitePosition, loading, loadingSat])

  const MyARScene = ({ sattelite, devAz }: any) => {
    // Valores de azimute e elevação do satélite (substitua pelos valores reais)
    // azimuth, elevation
    const diffDeviceSate = devAz - 54
    const azNew = sattelite.azimuth - diffDeviceSate
    const position = calculatePosition(azNew, 1, 2)
    // const position: any = [0, 0, 0]
    console.log({
      sum: azNew,
      satAz: sattelite.azimuth,
      devAz,
      date: new Date(),
    })
    const [trackingInitialized, setTrackingInitialized] = useState(false)

    const [scale] = useState<[number, number, number]>([0.002, 0.002, 0.002])

    // Função chamada quando o rastreamento é atualizado
    const onTrackingUpdated = (state: number, reason: number) => {
      console.log('Estado de rastreamento:', state, 'Razão:', reason)
      if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
        setTrackingInitialized(true)
      } else {
        setTrackingInitialized(false)
      }
    }

    return (
      <ViroARScene onTrackingUpdated={onTrackingUpdated}>
        <ViroAmbientLight color='#ffffff' intensity={1000} />
        {trackingInitialized && (
          <ViroNode position={position} scale={scale}>
            <Viro3DObject
              source={SatelliteIcon}
              type='OBJ'
              resources={[require('./res/satelite.mtl')]}
              rotation={[90, 0, 0]}
              onLoadEnd={() => console.log('Object loaded')}
              onError={(error) => console.error('Erro ao carregar o objeto 3D:', error)}
            />
          </ViroNode>
        )}
        {/* <ViroText
          scale={[0.5, 0.5, 0.5]}
          position={position}
          style={localStyles.helloWorldTextStyle}
          text={`Azimuth: ${deviceAzimuth.toFixed(0)}`}
        /> */}
      </ViroARScene>
    )
  }

  return loading || loadingSat ? (
    <View style={localStyles.outer}>
      <ActivityIndicator size={'small'} />
    </View>
  ) : (
    <View style={localStyles.outer}>
      {/* AR Scene */}
      <ViroARSceneNavigator
        worldAlignment='Gravity'
        autofocus={true}
        initialScene={{
          scene: () => <MyARScene sattelite={satellitePosition} devAz={azimuth} />,
        }}
        style={localStyles.arView}
      />

      {/* Overlay com fundo transparente e o alvo */}
      <View style={localStyles.overlay}>
        <View style={localStyles.targetCircle}></View>
      </View>
    </View>
  )
}

var localStyles = StyleSheet.create({
  outer: {
    flex: 1,
  },

  arView: {
    flex: 1,
  },

  helloWorldTextStyle: {
    fontFamily: 'Arial',
    fontSize: 30,
    color: '#ffffff',
    textAlignVertical: 'center',
    textAlign: 'center',
  },

  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Fundo semi-transparente
  },

  targetCircle: {
    width: 100, // Tamanho do círculo
    height: 100,
    borderRadius: 50, // Para deixar o quadrado circular
    borderWidth: 4, // Espessura da borda
    borderColor: 'white', // Cor da borda
    backgroundColor: 'transparent', // Fundo transparente
  },
})

export default SearchSatelliteRA
