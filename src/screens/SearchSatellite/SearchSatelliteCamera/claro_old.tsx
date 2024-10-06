import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, Dimensions, Platform, ActivityIndicator } from 'react-native'
import { useTheme } from 'styled-components'
import { Container } from './styles'
import { Label } from '~/components/Label/variants/index'
import { HeaderSecondary } from '~/components/HeaderSecondary'
import { RouteProp, useRoute } from '@react-navigation/native'
import { RootBottomTabParamList } from '~/routes'
import { Camera } from 'expo-camera'
import { Magnetometer, Accelerometer } from 'expo-sensors'
import Geolocation from 'react-native-geolocation-service'
import * as satellite from 'satellite.js'
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  BGCamera,
  BGCameraSuccess,
  VerticalIcon,
} from '~/assets/svgs'
import { normalize } from '~/utils'
import LeftArrowIcon from '~/assets/svgs/LeftArrowIcon'
import RightArrowIcon from '~/assets/svgs/RightArrowIcon'
import LeftArrowIconTwo from '~/assets/svgs/LeftArrowIconTwo'
import RightArrowIconTwo from '~/assets/svgs/RightArrowIconTwo'
import SignalSmallIcon from '~/assets/svgs/SignalSmallIcon'
import CheckSmallIcon from '~/assets/svgs/CheckSmallIcon'

type SearchSatelliteCameraProp = RouteProp<RootBottomTabParamList, 'SearchSatelliteCamera'>

const BOTTOM_VIEW_HEIGHT = normalize(100)

export const SearchSatelliteCamera = () => {
  const theme = useTheme()
  const route = useRoute<SearchSatelliteCameraProp>()

  const tleLine1 = route.params.data.tleLine1
  const tleLine2 = route.params.data.tleLine2

  const [hasPermission, setHasPermission] = useState(false)
  const [satellitePosition, setSatellitePosition] = useState({ azimuth: 0, elevation: 0 })
  const [magnetometerData, setMagnetometerData] = useState<any>(null)
  const [accelerometerData, setAccelerometerData] = useState<any>(null)
  const [deviceOrientation, setDeviceOrientation] = useState({ elevation: 0 })
  const [horizontalInstruction, setHorizontalInstruction] = useState<string | null>(null)

  const magnetometerDataRef = useRef<any>(null)
  const accelerometerDataRef = useRef<any>(null)
  const [sensorDataUpdated, setSensorDataUpdated] = useState(0)

  const [loading, setLoading] = useState(true)

  const [lastVerticalAzimuth, setLastVerticalAzimuth] = useState(0)
  const [isVertical, setIsVertical] = useState(true)

  const checkHorizontalInclination = (accelerometerData: any) => {
    const { x } = accelerometerData
    const inclinationThreshold = 0.1 // Threshold for inclination (change based on sensitivity needed)

    if (Math.abs(x) > inclinationThreshold) {
      setHorizontalInstruction(x > 0 ? 'Incline para a direita' : 'Incline para a esquerda')
    } else {
      setHorizontalInstruction(null)
    }
  }

  useEffect(() => {
    ;(async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === 'granted')
    })()

    Geolocation.getCurrentPosition(
      (position) => {
        calculateSatellitePosition(position.coords.latitude, position.coords.longitude)
      },
      (error) => {
        console.log(error.code, error.message)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    )

    _subscribe()
    return () => _unsubscribe()
  }, [])

  const _subscribe = () => {
    // Magnetometer.addListener((result) => {
    //   setMagnetometerData(result)
    // })
    // Accelerometer.addListener((result) => {
    //   setAccelerometerData(result)
    //   checkHorizontalInclination(result)
    // })

    Magnetometer.addListener((result) => {
      if (magnetometerDataRef?.current && !significantChange(magnetometerDataRef?.current, result))
        return
      magnetometerDataRef.current = result
      updateOrientation()
    })
    Accelerometer.addListener((result) => {
      if (
        accelerometerDataRef?.current &&
        !significantChange(accelerometerDataRef?.current, result)
      )
        return
      accelerometerDataRef.current = result
      checkHorizontalInclination(result)
      updateOrientation()
    })
  }

  const significantChange = (prevData: any, newData: any) => {
    if (!prevData || !newData) return true
    // Aqui você pode definir um limiar para mudanças significativas
    const threshold = 0.015
    return (
      Math.abs(prevData.x - newData.x) > threshold ||
      Math.abs(prevData.y - newData.y) > threshold ||
      Math.abs(prevData.z - newData.z) > threshold
    )
  }

  const _unsubscribe = () => {
    Magnetometer.removeAllListeners()
    Accelerometer.removeAllListeners()
  }

  const calculateSatellitePosition = (latitude: number, longitude: number) => {
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

  const isDeviceVertical = (accelerometerData: any) => {
    const { x, y, z } = accelerometerData
    const pitch = Math.atan2(x, Math.sqrt(y * y + z * z)) * (180 / Math.PI)
    return Math.abs(pitch) < 45
  }

  const updateOrientation = () => {
    if (magnetometerDataRef.current && accelerometerDataRef.current) {
      const { x: ax, y: ay, z: az } = accelerometerDataRef.current
      const elevation = Math.atan2(-az, Math.sqrt(ax * ax + ay * ay)) * (180 / Math.PI)
      const vertical = isDeviceVertical(accelerometerDataRef.current)
      setIsVertical(vertical)

      if (vertical) {
        const azimuth = calculateAzimuth(magnetometerDataRef, accelerometerDataRef)
        setLastVerticalAzimuth(azimuth ?? 0)
      }

      setDeviceOrientation({ elevation })
      setLoading(false)
    }
  }

  // useEffect(() => {
  //   try {
  //     if (magnetometerDataRef?.current && accelerometerDataRef?.current) {
  //       const { x: ax, y: ay, z: az } = accelerometerDataRef.current
  //       const elevation = Math.atan2(-az, Math.sqrt(ax * ax + ay * ay)) * (180 / Math.PI)
  //       const vertical = isDeviceVertical(accelerometerDataRef.current)
  //       setIsVertical(vertical)

  //       if (vertical) {
  //         const azimuth = calculateAzimuth(magnetometerDataRef, accelerometerDataRef)
  //         setLastVerticalAzimuth(azimuth ?? 0)
  //       }

  //       setDeviceOrientation({ elevation })
  //       setLoading(false)
  //     }
  //   } catch (er) {
  //     console.log(er)
  //   }
  // }, [sensorDataUpdated])

  const calculateAzimuth = (magnetometer: any, accelerometer: any) => {
    if (!magnetometer.current || !accelerometer.current) return
    const { x: mx, y: my, z: mz } = magnetometer.current
    const { x: ax, y: ay, z: az } = accelerometer.current

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

    azimuth = 360 - azimuth + -15
    if (azimuth >= 360) {
      azimuth -= 360
    }
    if (azimuth < 0) {
      azimuth += 360
    }

    return azimuth
  }

  const azimuth = isVertical
    ? calculateAzimuth(magnetometerDataRef, accelerometerDataRef)
    : lastVerticalAzimuth

  const getDirection = () => {
    if (!magnetometerDataRef?.current || !accelerometerDataRef?.current)
      return { vertical: null, horizontal: null }

    const { azimuth: satAzimuth, elevation: satElevation } = satellitePosition
    const { elevation: devElevation } = deviceOrientation

    if (!azimuth) return
    let deltaAzimuth = satAzimuth - azimuth
    const deltaElevation = satElevation - devElevation

    if (deltaAzimuth > 180) {
      deltaAzimuth -= 360
    } else if (deltaAzimuth < -180) {
      deltaAzimuth += 360
    }

    const azimuthThreshold = 10
    const elevationThreshold = 5

    let verticalDirection = null
    let horizontalDirection = null

    if (Math.abs(deltaElevation) > elevationThreshold) {
      verticalDirection = deltaElevation > 0 ? 'up' : 'down'
    }

    if (Math.abs(deltaAzimuth) > azimuthThreshold) {
      horizontalDirection = deltaAzimuth > 0 ? 'right' : 'left'
    }

    return { vertical: verticalDirection, horizontal: horizontalDirection }
  }

  const direction = getDirection()

  const getBackgroundColor = () => {
    const { azimuth: satAzimuth, elevation: satElevation } = satellitePosition
    const { elevation: devElevation } = deviceOrientation

    let deltaAzimuth = satAzimuth - (azimuth ?? 0)
    const deltaElevation = satElevation - devElevation

    if (deltaAzimuth > 180) {
      deltaAzimuth -= 360
    } else if (deltaAzimuth < -180) {
      deltaAzimuth += 360
    }

    const azimuthThreshold = 10
    const elevationThreshold = 5
    const azimuthWarningThreshold = 60
    const elevationWarningThreshold = 40

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

  const backgroundColor = getBackgroundColor()

  const availableHeight =
    Dimensions.get('window').height -
    BOTTOM_VIEW_HEIGHT -
    (Platform.OS === 'ios' ? normalize(75) : 0)

  if (hasPermission === null) {
    return <View />
  }
  if (hasPermission === false) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}>
        <HeaderSecondary title={`Satélite ${route.params.title}` ?? 'Localizar Satélite'} />
        <Container>
          <Label>Precisamos que você forneça acesso a sua câmera.</Label>
        </Container>
      </View>
    )
  }
  return loading ? (
    <View style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}>
      <HeaderSecondary title={`Satélite ${route.params.title}` ?? 'Localizar Satélite'} />
      <Container style={{ paddingTop: normalize(12) }}>
        <ActivityIndicator size='large' color='#000' />
      </Container>
    </View>
  ) : (
    <View style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}>
      <HeaderSecondary title={`Satélite ${route.params.title}` ?? 'Localizar Satélite'} />
      <Container style={{ paddingTop: normalize(12) }}>
        <Camera style={{ flex: 1 }}>
          <View style={styles.overlay}>
            <View style={{ position: 'absolute', top: 0 }}>
              {((direction?.vertical === null && direction.horizontal === null) ||
                backgroundColor === 'warning') &&
              azimuth ? (
                <View
                  style={{
                    backgroundColor: '#000',
                    opacity: 0.4,
                    width: Dimensions.get('window').width,
                    height: availableHeight,
                  }}
                >
                  <View style={{ position: 'absolute', top: '2%' }}>
                    <BGCameraSuccess
                      width={Dimensions.get('window').width}
                      height={availableHeight}
                      color={backgroundColor === 'warning' ? '#F9CF3A' : undefined}
                    />
                    <View
                      style={{
                        position: 'absolute',
                        bottom: '25%',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor:
                          backgroundColor === 'warning'
                            ? 'rgba(249, 207, 58, 0.70)'
                            : 'rgba(8, 135, 93, 0.70)',
                        paddingTop: 8,
                        paddingBottom: 8,
                        paddingLeft: 16,
                        paddingRight: 16,
                        borderRadius: 10,
                        alignSelf: 'center',
                      }}
                    >
                      {backgroundColor === 'warning' ? (
                        <SignalSmallIcon style={{ marginRight: 6 }} />
                      ) : (
                        <CheckSmallIcon style={{ marginRight: 6 }} />
                      )}
                      <Label color='#fff' fontSize={14} textAlign='center' isMedium lineHeight={17}>
                        {backgroundColor === 'warning' ? 'Está perto!' : 'Satélite encontrado!'}
                      </Label>
                    </View>
                  </View>
                </View>
              ) : (
                <View
                  style={{
                    backgroundColor: '#000',
                    opacity: 0.4,
                    width: Dimensions.get('window').width,
                    height: availableHeight,
                  }}
                >
                  <View style={{ position: 'absolute', top: '2%' }}>
                    <BGCamera width={Dimensions.get('window').width} height={availableHeight} />
                  </View>
                </View>
              )}
            </View>
            {(!isVertical || !!horizontalInstruction) && (
              <View
                style={{
                  position: 'absolute',
                  bottom: '12%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.70)',
                  paddingTop: 8,
                  paddingBottom: 8,
                  paddingLeft: 16,
                  paddingRight: 16,
                  borderRadius: 10,
                }}
              >
                <VerticalIcon style={{ marginRight: 6 }} />
                <Label color='#fff' fontSize={14} textAlign='center' isMedium lineHeight={17}>
                  Por favor, coloque o aparelho na vertical.
                </Label>
              </View>
            )}
            {direction?.vertical === 'up' && (
              <ArrowUpIcon style={{ position: 'absolute', top: 50 }} />
            )}
            {direction?.vertical === 'down' && (
              <ArrowDownIcon style={{ position: 'absolute', bottom: 50 }} />
            )}
            {direction?.horizontal === 'left' &&
              Math.abs(deviceOrientation.elevation - satellitePosition.elevation) <= 10 && (
                <ArrowLeftIcon
                  style={{
                    position: 'absolute',
                    left: 20,
                    top: Platform.OS === 'ios' ? '50%' : '52%',
                  }}
                />
              )}
            {horizontalInstruction === 'Incline para a esquerda' && (
              <LeftArrowIcon
                style={{
                  position: 'absolute',
                  left: normalize(60),
                  top: Platform.OS === 'ios' ? '50%' : '52%',
                }}
              />
            )}
            {horizontalInstruction === 'Incline para a esquerda' && (
              <RightArrowIcon
                style={{
                  position: 'absolute',
                  right: normalize(60),
                  top: Platform.OS === 'ios' ? '50%' : '52%',
                }}
              />
            )}
            {horizontalInstruction === 'Incline para a direita' && (
              <LeftArrowIconTwo
                style={{
                  position: 'absolute',
                  left: normalize(60),
                  top: Platform.OS === 'ios' ? '50%' : '52%',
                }}
              />
            )}
            {horizontalInstruction === 'Incline para a direita' && (
              <RightArrowIconTwo
                style={{
                  position: 'absolute',
                  right: normalize(60),
                  top: Platform.OS === 'ios' ? '50%' : '52%',
                }}
              />
            )}
            {direction?.horizontal === 'right' &&
              Math.abs(deviceOrientation.elevation - satellitePosition.elevation) <= 10 && (
                <ArrowRightIcon
                  style={{
                    position: 'absolute',
                    right: 20,
                    top: Platform.OS === 'ios' ? '50%' : '52%',
                  }}
                />
              )}
          </View>
        </Camera>
        <View style={{ padding: 16, height: '11%' }}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Label fontSize={12} lineHeight={17} style={{ flexBasis: '48%' }}>
              Satélite Azimuth:{' '}
              <Label color='#4397B0' fontSize={12} lineHeight={17}>
                {satellitePosition.azimuth.toFixed(0)}°
              </Label>
            </Label>
            <View style={{ height: 32, width: 1, backgroundColor: '#D4D4D8' }} />
            <Label fontSize={12} lineHeight={17} style={{ flexBasis: '48%' }}>
              Satélite Elevação:{' '}
              <Label color='#4397B0' fontSize={12} lineHeight={17}>
                {satellitePosition.elevation.toFixed(0)}°
              </Label>
            </Label>
          </View>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Label fontSize={12} lineHeight={17} style={{ flexBasis: '48%' }}>
              Dispositivo Azimuth:{' '}
              <Label color='#4397B0' fontSize={12} lineHeight={17}>
                {(azimuth ?? 0).toFixed(0)}°
              </Label>
            </Label>
            <Label fontSize={12} lineHeight={17} style={{ flexBasis: '48%' }}>
              Dispositivo Elevação:{' '}
              <Label color='#4397B0' fontSize={12} lineHeight={17}>
                {deviceOrientation.elevation.toFixed(0)}°
              </Label>
            </Label>
          </View>
        </View>
      </Container>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 50,
    color: 'white',
  },
  instruction: {
    fontSize: 18,
    color: 'white',
    position: 'absolute',
    bottom: 50,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
})
