import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  ActivityIndicator,
  Image,
  PermissionsAndroid,
  Alert,
  Linking,
} from 'react-native'
import { useTheme } from 'styled-components'
import { Container } from './styles'
import { Label } from '~/components/Label/variants/index'
import { HeaderSecondary } from '~/components/HeaderSecondary'
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { RootBottomTabParamList } from '~/routes'
import { Camera } from 'expo-camera'
import { Accelerometer, Magnetometer } from 'expo-sensors'
import * as ScreenOrientation from 'expo-screen-orientation'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import Geolocation from 'react-native-geolocation-service'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'
import { Audio } from 'expo-av'
import geomagnetism from 'geomagnetism'
import * as Location from 'expo-location'
import _ from 'lodash'

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
import { Svg } from 'react-native-svg'
import ModalInstructions from '../components'
import {
  calculateSatellitePosition,
  checkHorizontalInclination,
  getBackgroundColor,
  getDirection,
  isDeviceVertical,
} from '~/utils/satellite'
import ModalInfo from '~/components/ModalInfo'
import SatelliteFixed from '../components/SatelliteFixed'

const initialInstructions = [
  {
    description: 'Calibre a bússola fazendo o movimento de infinito com o celular!',
    img: require('../components/images/01.gif'),
  },
  {
    description: 'Mantenha o aparelho longe de imãs para não influenciar na medição!',
    img: require('../components//images/02.png'),
  },
  {
    description: 'Posicione o aparelho na vertical!',
    img: require('../components//images/03.png'),
  },
  {
    description: 'Mexa-se lentamente para melhorar a precisão!',
    img: require('../components//images/04.png'),
  },
]

type SearchSatelliteCameraProp = RouteProp<RootBottomTabParamList, 'SearchSatelliteCamera'>

const BOTTOM_VIEW_HEIGHT = normalize(100)
const SENSOR_UPDATE_INTERVAL = 16
const ANIMATION_DURATION = 100
const markerWidth = 70
const markerHeight = 35
const motionThreshold = 0.01
const azimuthThreshold = 2
const elevationThreshold = 1

function getRotationMatrix(accelerometer: any, magnetometer: any) {
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

function getOrientation(R: any) {
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

const playBeepSound = async (beepSoundRef: React.MutableRefObject<Audio.Sound | null>) => {
  try {
    if (beepSoundRef.current) {
      await beepSoundRef.current.setPositionAsync(0)
      await beepSoundRef.current.playAsync()
    } else {
      const { sound } = await Audio.Sound.createAsync(require('./file/arquivo.mp3'))
      beepSoundRef.current = sound
      await sound.playAsync()
    }
  } catch (er) {
    console.log(er)
  }
}

const playSuccessSound = async (successSoundRef: React.MutableRefObject<Audio.Sound | null>) => {
  try {
    if (successSoundRef.current) {
      await successSoundRef.current.playAsync()
    } else {
      const { sound } = await Audio.Sound.createAsync(require('./file/arquivo.mp3'))
      successSoundRef.current = sound
      await sound.setIsLoopingAsync(true)
      await sound.playAsync()
    }
  } catch (er) {
    console.log(er)
  }
}

const stopSuccessSound = async (successSoundRef: React.MutableRefObject<Audio.Sound | null>) => {
  try {
    if (successSoundRef.current) {
      await successSoundRef.current.pauseAsync()
    }
  } catch (er) {
    console.log(er)
  }
}

export const SearchSatelliteCamera = () => {
  const theme = useTheme()
  const route = useRoute<SearchSatelliteCameraProp>()

  const tleLine1 = route.params.data.tleLine1
  const tleLine2 = route.params.data.tleLine2
  const [modalInstructions, setModalInstructions] = useState(false)
  const [instructions, setInstructions] = useState<any[]>([])
  const [modalInstructionsHeader, setModalInstructionsHeader] = useState(false)
  const [declination, setDeclination] = useState(0)

  const [hasLocationPermission, setHasLocationPermission] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  const [satellitePosition, setSatellitePosition] = useState({ azimuth: 0, elevation: 0 })
  const [deviceOrientation, setDeviceOrientation] = useState({ elevation: 0 })
  const [horizontalInstruction, setHorizontalInstruction] = useState<string | null>(null)
  const [modalError, setModalError] = useState(false)
  const navigation = useNavigation()
  const [modalNotificationVisible, setModalNotificationVisible] = useState(false)
  const [loading, setLoading] = useState(true)
  const [orientation, setOrientation] = useState(ScreenOrientation.Orientation.PORTRAIT_UP)
  const [accelerometerAvailable, setAccelerometerAvailable] = useState(true)
  const [magnetometerAvailable, setMagnetometerAvailable] = useState(true)

  const [backgroundColor, setBackgroundColor] = useState('default')

  const [isVertical, setIsVertical] = useState(true)

  const [azimuth, setAzimuth] = useState<number | null>(null)

  const [direction, setDirection] = useState<{
    vertical: string | null
    horizontal: string | null
  }>({ vertical: null, horizontal: null })

  const [adjustedAzimuth, setAdjustedAzimuth] = useState(0)
  const [smoothedAzimuth, setSmoothedAzimuth] = useState<number>(0)
  const [elevationNew, setElevationNew] = useState(0)

  useEffect(() => {
    let watchId: any = null
    const requestPermissionsAndLocation = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === 'granted')

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
      ScreenOrientation.getOrientationAsync().then((info) => {
        setOrientation(info)
      })

      const getLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
          console.log('Permissão de localização negada')
          return
        }

        let location = await Location.getCurrentPositionAsync({})
        const { latitude, longitude } = location.coords

        const magneticModel = geomagnetism.model()
        const geoData = magneticModel.point([latitude, longitude])
        setDeclination(geoData.decl)
      }

      getLocation()

      ScreenOrientation.addOrientationChangeListener((evt) => {
        setOrientation(evt.orientationInfo.orientation)
      })

      setHasLocationPermission(locationGranted)
      setModalNotificationVisible(locationGranted === false)

      if (locationGranted) {
        NetInfo.fetch().then(async (state) => {
          if (state.isConnected) {
            Geolocation.getCurrentPosition(
              async (position) => {
                await AsyncStorage.setItem('lastPosition', JSON.stringify(position.coords))
                calculateSatellitePosition(
                  position.coords.latitude,
                  position.coords.longitude,
                  tleLine1,
                  tleLine2,
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
                  tleLine1,
                  tleLine2,
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
                    tleLine1,
                    tleLine2,
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
  }, [hasLocationPermission])

  const latestMagnetometerDataRef = useRef<any>(null)
  const latestAccelerometerDataRef = useRef<any>(null)
  const animationFrameIdRef = useRef<any>(null)
  const previousAzimuthRef = useRef<any>(null)
  const previousElevationRef = useRef<any>(null)

  useEffect(() => {
    Accelerometer.setUpdateInterval(SENSOR_UPDATE_INTERVAL)
    Magnetometer.setUpdateInterval(SENSOR_UPDATE_INTERVAL)
    Accelerometer.isAvailableAsync().then(setAccelerometerAvailable)

    Magnetometer.isAvailableAsync().then(setMagnetometerAvailable)

    const magnetometerSubscription = Magnetometer.addListener((data) => {
      latestMagnetometerDataRef.current = data
    })

    const accelerometerSubscription = Accelerometer.addListener((data) => {
      latestAccelerometerDataRef.current = data
    })

    const updateMarkerPosition = () => {
      if (latestMagnetometerDataRef.current && latestAccelerometerDataRef.current) {
        calculateOrientation()

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
        const vertical = isDeviceVertical(accelerometerN)
        setIsVertical(vertical)
        checkHorizontalInclination(accelerometerN, setHorizontalInstruction)
        setAzimuth(adjustedAzimuthValue)

        if (satellitePosition) {
          const direction = getDirection({
            azimuth: adjustedAzimuthValue,
            satellitePosition,
            deviceOrientation: { elevation: pitchDeg },
          })
          setDirection(direction)

          if (adjustedAzimuthValue && pitchDeg > 0) {
            const bgColor = getBackgroundColor({
              satellitePosition,
              deviceOrientation: { elevation: pitchDeg },
              azimuth: adjustedAzimuthValue,
            })
            setBackgroundColor(bgColor)
          } else if (pitchDeg <= 0) {
            setBackgroundColor('default')
          }
        } else {
          setBackgroundColor('default')
        }
      }
    }
  }

  useEffect(() => {
    const checkModalDisplayed = async () => {
      if (loading) return
      try {
        const lastDisplayed = await AsyncStorage.getItem('lastDisplayedModalDateAll')
        const today = new Date().toISOString().split('T')[0]

        const storedInstructions = await AsyncStorage.getItem('skippedInstructions')
        const instructions = storedInstructions
          ? JSON.parse(storedInstructions)
          : initialInstructions

        if (lastDisplayed !== today && instructions.length > 0) {
          setModalInstructions(true)
          await AsyncStorage.setItem('lastDisplayedModalDateAll', today)
        }
      } catch (error) {
        console.error('Error checking modal display status:', error)
      }
    }
    checkModalDisplayed()
  }, [loading])

  // ---- SATELITE REALIDADE AUMENTADA ----
  const availableHeight =
    Dimensions.get('window').height -
    BOTTOM_VIEW_HEIGHT -
    (Platform.OS === 'ios' ? normalize(75) : 0)

  const viewRef = useRef<View>(null)
  const onLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout
    setViewSize({ width, height })
  }

  const getScreenPosition = (
    satAzimuth: number,
    satElevation: number,
    devAzimuth: number,
    devElevation: number
  ) => {
    const { width, height } = Dimensions.get('window')
    const headerHeight = normalize(90)
    const footerHeight = viewSize?.height ?? height * 0.11
    const availableHeight = height - headerHeight - footerHeight

    const amplificationFactor = 2.6

    let azimuthDifference = satAzimuth - devAzimuth
    if (azimuthDifference > 180) azimuthDifference -= 360
    if (azimuthDifference < -180) azimuthDifference += 360

    const maxAzimuthDifference = 45
    let normalizedAzimuthDifference = azimuthDifference / maxAzimuthDifference
    normalizedAzimuthDifference = Math.max(-1, Math.min(1, normalizedAzimuthDifference))
    let x = normalizedAzimuthDifference * (width / 2) + width / 2
    x = Math.max(0, Math.min(width, x))

    let elevationDifference = satElevation - devElevation
    elevationDifference *= amplificationFactor

    const y = headerHeight + ((90 - elevationDifference) / 180) * availableHeight

    return { x, y: y - 70 / 2 }
  }

  const { width, height } = Dimensions.get('window')
  const cameraHeight = height * 0.89 - normalize(90)

  const [viewSize, setViewSize] = useState({ width, height: cameraHeight })
  const animatedX = useSharedValue(width / 2)
  const animatedY = useSharedValue(cameraHeight / 2)

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: animatedX.value - markerWidth / 2 },
        { translateY: animatedY.value - markerHeight / 2 },
      ],
    }
  })

  useEffect(() => {
    const updatePosition = () => {
      const { x, y } = getScreenPosition(
        satellitePosition.azimuth,
        satellitePosition.elevation,
        adjustedAzimuth ?? 0,
        elevationNew
      )
      animatedX.value = withTiming(x, { duration: 150 })
      animatedY.value = withTiming(y, { duration: 150 })
    }

    updatePosition()
  }, [satellitePosition, smoothedAzimuth, elevationNew])

  useEffect(() => {
    if (!loading && satellitePosition.azimuth === 0 && satellitePosition.elevation === 0) {
      setModalError(true)
    }
  }, [loading, satellitePosition])

  // ------ ------- ------ BEEP

  const warningIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const successSoundRef = useRef<Audio.Sound | null>(null)
  const beepSoundRef = useRef<Audio.Sound | null>(null)
  const isMounted = useRef(true)

  useEffect(() => {
    const handleWarningSound = () => {
      if (warningIntervalRef.current) {
        clearInterval(warningIntervalRef.current)
      }

      warningIntervalRef.current = setInterval(() => {
        if (isMounted.current && !loading) {
          playBeepSound(beepSoundRef)
        }
      }, 1000)

      stopSuccessSound(successSoundRef)
    }

    const handleSuccessSound = () => {
      if (warningIntervalRef.current) {
        clearInterval(warningIntervalRef.current)
        warningIntervalRef.current = null
      }

      playSuccessSound(successSoundRef)
    }

    if (!loading) {
      if (
        backgroundColor === 'warning' &&
        isVertical &&
        (satellitePosition?.elevation ?? 0) > 0 &&
        (satellitePosition?.azimuth ?? 0) > 0
      ) {
        handleWarningSound()
      } else if (
        backgroundColor === 'success' &&
        isVertical &&
        (satellitePosition?.elevation ?? 0) > 0 &&
        (satellitePosition?.azimuth ?? 0) > 0
      ) {
        handleSuccessSound()
      } else {
        if (warningIntervalRef.current) {
          clearInterval(warningIntervalRef.current)
          warningIntervalRef.current = null
        }
        stopSuccessSound(successSoundRef)
      }
    }

    return () => {
      if (warningIntervalRef.current) {
        clearInterval(warningIntervalRef.current)
      }
      stopSuccessSound(successSoundRef)
    }
  }, [backgroundColor, loading, isVertical, satellitePosition])

  useFocusEffect(
    React.useCallback(() => {
      isMounted.current = true

      setBackgroundColor('default')

      return () => {
        isMounted.current = false

        if (warningIntervalRef.current) {
          clearInterval(warningIntervalRef.current)
          warningIntervalRef.current = null
        }
        stopSuccessSound(successSoundRef)
      }
    }, [])
  )

  if (hasPermission === null) {
    return <View />
  }
  if (hasPermission === false) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}>
        <HeaderSecondary title={`Satélite ${route.params.title}` ?? 'Localizar Satélite'} />
        <Container>
          <Label>
            Para acessar essa funcionalidade permita o acesso a câmera nas configurações do
            aparelho!
          </Label>
        </Container>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}>
        <HeaderSecondary title={`Satélite ${route.params.title}` ?? 'Localizar Satélite'} />
        <Container style={{ paddingTop: normalize(12) }}>
          <ActivityIndicator size='large' color='#000' />
        </Container>
      </View>
    )
  }
  if (hasLocationPermission === false) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}>
        <HeaderSecondary title={`Satélite ${route.params.title}` ?? 'Localizar Satélite'} />
        <Container
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          <Label fontSize={16} textAlign='center' isMedium style={{ maxWidth: 250 }}>
            Para acessar essa funcionalidade permita o compartilhamento de localização nas
            configurações do aparelho!
          </Label>
        </Container>
        <ModalInfo
          message={
            'Ative o compartilhamento de localização nas configurações do seu aparelho para usar essa funcionalidade!'
          }
          loading={false}
          onChangeVisible={async () => {
            try {
              let locationGranted = false

              if (Platform.OS === 'ios') {
                const locationStatus: any = await Geolocation.requestAuthorization('whenInUse')
                locationGranted = locationStatus === 'granted' || locationStatus === 'whenInUse'

                if (!locationGranted) {
                  Linking.openURL('app-settings:')
                  navigation.goBack()
                }
              } else {
                try {
                  const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                      title: 'Permissão de Localização',
                      message: 'Este aplicativo precisa acessar sua localização.',
                      buttonNeutral: 'Pergunte-me depois',
                      buttonNegative: 'Cancelar',
                      buttonPositive: 'OK',
                    }
                  )

                  if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert(
                      'Permissão de localização negada',
                      'Você precisa permitir a localização nas configurações do aplicativo.',
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Abrir Configurações',
                          onPress: () => {
                            Linking.openSettings()
                            navigation.goBack()
                          },
                        },
                      ]
                    )
                  } else {
                    locationGranted = true
                    setLoading(true)
                    setModalError(false)
                    setTimeout(() => {
                      setLoading(false)
                    }, 3000)
                  }
                } catch (err) {
                  console.warn(err)
                }
              }

              setHasLocationPermission(locationGranted)
              setModalNotificationVisible(locationGranted === false)
            } catch (error) {
              console.error('Error requesting location permission:', error)
            }
          }}
          transparent
          modalIsVisible={modalNotificationVisible}
          buttonText='Solicitar permissões'
          textJustfy
          isActionSend
          actionSecond={() => {
            navigation.goBack()
            setModalError(false)
          }}
          secondButtonText={'Voltar'}
        />
      </View>
    )
  }

  if (
    !loading &&
    deviceOrientation.elevation <= 0 &&
    adjustedAzimuth <= 0 &&
    (!accelerometerAvailable || !magnetometerAvailable) &&
    hasLocationPermission
  ) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}>
        <HeaderSecondary
          title={`Satélite ${route.params.title}` ?? 'Localizar Satélite'}
          isInfo
          action={async () => {
            await AsyncStorage.removeItem('skippedInstructions')
            setInstructions(initialInstructions)
            setModalInstructionsHeader(true)
          }}
        />
        <SatelliteFixed
          azimuth={satellitePosition.azimuth.toFixed(0)}
          elevation={satellitePosition.elevation.toFixed(0)}
        />
      </View>
    )
  }

  return loading && !satellitePosition?.azimuth ? (
    <View style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}>
      <HeaderSecondary title={`Satélite ${route.params.title}` ?? 'Localizar Satélite'} />
      <Container style={{ paddingTop: normalize(12) }}>
        <ActivityIndicator size='large' color='#000' />
      </Container>
    </View>
  ) : (
    <View style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}>
      <HeaderSecondary
        title={`Satélite ${route.params.title}` ?? 'Localizar Satélite'}
        isInfo
        action={async () => {
          await AsyncStorage.removeItem('skippedInstructions')
          setInstructions(initialInstructions)
          setModalInstructionsHeader(true)
        }}
      />
      <Container style={{ paddingTop: normalize(12) }}>
        <Camera style={{ flex: 1 }}>
          <View style={styles.overlay}>
            {(backgroundColor === 'success' || backgroundColor === 'warning') && (
              <Svg
                style={[
                  StyleSheet.absoluteFill,
                  { flex: 1, width: '100%', height: '100%', zIndex: 10000000000 },
                ]}
              >
                <Animated.Image
                  source={require('../../../assets/images/satelite.png')}
                  style={[
                    {
                      position: 'absolute',
                      width: markerWidth,
                      height: markerHeight,
                      zIndex: 10000000000,
                    },
                    animatedStyle,
                  ]}
                />
              </Svg>
            )}
            <View style={{ position: 'absolute', top: 0 }}>
              {((direction?.vertical === null && direction.horizontal === null) ||
                backgroundColor === 'warning') &&
              azimuth ? (
                <View style={{ width: Dimensions.get('window').width, height: availableHeight }}>
                  <View
                    style={{
                      position: 'absolute',
                      backgroundColor: '#000',
                      opacity: 0.6,
                      width: '100%',
                      height: '100%',
                    }}
                  />

                  <View style={{ position: 'absolute', top: '2%', width: '100%', height: '100%' }}>
                    <BGCameraSuccess
                      width={Dimensions.get('window').width}
                      height={availableHeight}
                      color={backgroundColor === 'warning' ? '#F9CF3A' : undefined}
                      showSuccess={false}
                    />
                    {/* {backgroundColor === 'warning' ? null : (
                      <Image
                        source={require('../../../assets/images/satelite.png')}
                        style={[
                          {
                            position: 'absolute',
                            width: 70,
                            height: 35,
                            left: '42%',
                            top: '48%',
                          },
                        ]}
                      />
                    )} */}

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
                        opacity: 1,
                      }}
                    >
                      {backgroundColor === 'warning' ? (
                        <SignalSmallIcon style={{ marginRight: 6 }} />
                      ) : (
                        <CheckSmallIcon style={{ marginRight: 6 }} />
                      )}
                      <Label
                        color='#fff'
                        fontSize={16}
                        textAlign='center'
                        isMedium
                        lineHeight={17}
                        style={{ opacity: 1 }}
                      >
                        {backgroundColor === 'warning' ? 'Está perto!' : 'Satélite encontrado!'}
                      </Label>
                    </View>
                  </View>
                </View>
              ) : (
                <View
                  style={{
                    backgroundColor: '#000',
                    opacity: 0.6,
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
                <Label color='#fff' fontSize={16} textAlign='center' isMedium lineHeight={17}>
                  Mantenha o aparelho na vertical.
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
        <View style={{ padding: 16, height: '11%' }} ref={viewRef} onLayout={onLayout}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Label fontSize={14} lineHeight={17} style={{ flexBasis: '48%' }}>
              Sat. Azimuth:{' '}
              <Label color='#4397B0' fontSize={14} lineHeight={17}>
                {satellitePosition.azimuth.toFixed(0)}°
              </Label>
            </Label>
            <View style={{ height: 32, width: 1, backgroundColor: '#D4D4D8' }} />
            <Label fontSize={14} lineHeight={17} style={{ flexBasis: '48%' }}>
              Sat. Elevação:{' '}
              <Label color='#4397B0' fontSize={14} lineHeight={17}>
                {satellitePosition.elevation.toFixed(0)}°
              </Label>
            </Label>
          </View>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Label fontSize={14} lineHeight={17} style={{ flexBasis: '48%' }}>
              Disp. Azimuth:{' '}
              <Label color='#4397B0' fontSize={14} lineHeight={17}>
                {(adjustedAzimuth ?? 0).toFixed(0)}°
              </Label>
            </Label>
            <Label fontSize={14} lineHeight={17} style={{ flexBasis: '48%' }}>
              Disp. Elevação:{' '}
              <Label color='#4397B0' fontSize={14} lineHeight={17}>
                {deviceOrientation.elevation.toFixed(0)}°
              </Label>
            </Label>
          </View>
        </View>
      </Container>
      <ModalInstructions
        onChangeVisible={() => setModalInstructions(false)}
        transparent
        modalIsVisible={modalInstructions && !modalError}
      />
      <ModalInstructions
        onChangeVisible={() => setModalInstructionsHeader(false)}
        transparent
        modalIsVisible={modalInstructionsHeader && !modalError}
        instructionsArr={instructions}
        hasInstructions
      />
      <ModalInfo
        message={`Infelizmente o aparelho não atende os requisitos necessários para executar essa funcionalidade.\n\nEstamos trabalhando para aumentar a compatibilidade, fique atento às novas atualizações na loja de aplicativos!`}
        title='Funcionalidade Indisponível'
        loading={false}
        onChangeVisible={() => {
          navigation.goBack()
          setModalError(false)
        }}
        transparent
        modalIsVisible={modalError}
        buttonText='Entendi'
        textJustfy
      />
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
