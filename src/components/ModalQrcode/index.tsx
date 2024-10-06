import React, { useEffect, useState } from 'react'
import { Modal as ModalNative, StyleSheet, View } from 'react-native'
import { Container } from './styles'
import { useTheme } from 'styled-components'
import { Label } from '~/components/Label/variants'
import { useIsFocused } from '@react-navigation/native'

import { BarCodeScanner } from 'expo-barcode-scanner'
import { Button } from '../Button'
import { normalize } from '~/utils'

interface IModalText {
  onChangeVisible: () => void
  transparent: boolean
  modalIsVisible: boolean
  setData: React.Dispatch<
    React.SetStateAction<{
      scua: string
      caid: string
    }>
  >
  handleError?: (message: string) => void
}

export default function ModalQrcode({
  onChangeVisible,
  transparent,
  modalIsVisible,
  setData,
  handleError,
}: IModalText) {
  const theme = useTheme()

  const [hasPermission, setHasPermission] = useState(false)
  const [scanned, setScanned] = useState(false)
  const isFocused = useIsFocused()

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status: sttsGet } = await BarCodeScanner.getPermissionsAsync()
      setHasPermission(sttsGet === 'granted')
      if (sttsGet !== 'granted') {
        const { status } = await BarCodeScanner.requestPermissionsAsync()
        setHasPermission(status === 'granted')
      }
    }

    getBarCodeScannerPermissions()
  }, [])

  const handleBarCodeScanned = ({ type, data }: { type: number; data: string }) => {
    try {
      setScanned(true)

      if (!data) throw new Error('O QR Code lido é inválido.')

      const caidRegex = /caid=([^&\n]+)/
      const scuaRegex = /scua=([^&\n]+)/
      const url = decodeURIComponent(data).toLowerCase()

      const caid = url.match(caidRegex)?.[1]
      const scua = url.match(scuaRegex)?.[1]

      if (!caid || !scua) return

      setData({
        scua: scua.toUpperCase(),
        caid: caid.toUpperCase(),
      })
    } catch (error) {
      handleError?.('O QR Code lido é inválido.')
    } finally {
      setScanned(false)
      onChangeVisible()
    }
  }

  return (
    <ModalNative
      animationType='fade'
      transparent={transparent}
      visible={modalIsVisible}
      onRequestClose={onChangeVisible}
    >
      <View
        style={{
          backgroundColor: '#0008',
          flex: 1,
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          {!hasPermission ? (
            <Container>
              <Label>Precisamos de acesso a sua câmera para a leitura do qrcode.</Label>
            </Container>
          ) : (
            <Container>
              {isFocused && (
                <BarCodeScanner
                  onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                  style={[StyleSheet.absoluteFillObject, { flex: 1 }]}
                />
              )}
              <View style={{ marginTop: 'auto', marginBottom: normalize(24) }}>
                <Button
                  text='voltar'
                  onPress={onChangeVisible}
                  color={theme.COLORS.WHITE}
                  textColor={theme.COLORS.SECONDARY_900}
                  border={theme.COLORS.SECONDARY_900}
                />
              </View>
            </Container>
          )}
        </View>
      </View>
    </ModalNative>
  )
}
