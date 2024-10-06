import React from 'react'
import { Dimensions, ScrollView, View } from 'react-native'
import { useTheme } from 'styled-components'
import { Label } from '~/components/Label/variants'
import { useNavigation } from '@react-navigation/native'
import { Button } from '~/components/Button'
import { Container, Image } from './styles'
import { normalize } from '~/utils'
import { SatelitteBgIcon } from '~/assets/svgs'

interface SatelliteFixed {
  azimuth: string
  elevation: string
}

const { width: screenWidth } = Dimensions.get('window')
export default function SatelliteFixed({ azimuth, elevation }: SatelliteFixed) {
  const theme = useTheme()
  const navigation = useNavigation()
  const imageSize = screenWidth * 0.4
  const imageBiggerSize = screenWidth >= 380 ? 250 : screenWidth * 0.7
  const fontSize = screenWidth >= 380 ? 20 : 14

  return (
    <ScrollView
      style={{ flex: 1, flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <Container>
        <Label lineHeight={25} fontSize={16} textAlign={'center'} style={{ marginBottom: 32 }}>
          A posição do satélite foi calculada com base na sua localização. Ajuste a antena conforme
          essa orientação para obter a melhor sintonia.
        </Label>

        <View style={{ marginTop: normalize(48) }} />
        <View>
          <Image
            source={require('../images/satelitte.png')}
            style={{
              width: imageSize,
              height: imageSize,
              resizeMode: 'contain',
              alignSelf: 'center',
            }}
          />
          <View style={{ position: 'absolute', right: '3%', top: '-10%' }}>
            <SatelitteBgIcon style={{ alignSelf: 'center' }} />
            <Label
              isBold
              color={theme.COLORS.SECONDARY_900}
              fontSize={fontSize}
              textAlign={'center'}
              style={{ marginTop: 8 }}
            >
              {elevation ?? 0}º Elevação
            </Label>
          </View>
        </View>
        <View style={{ marginTop: normalize(48) }} />
        <View>
          <Image
            source={require('../images/bussola.png')}
            style={{
              width: imageBiggerSize,
              height: imageBiggerSize,
              resizeMode: 'contain',
              alignSelf: 'center',
            }}
          />
          <View style={{ position: 'absolute', right: '3%', top: '0%' }}>
            <SatelitteBgIcon style={{ alignSelf: 'center' }} />
            <Label
              isBold
              color={theme.COLORS.SECONDARY_900}
              fontSize={fontSize}
              textAlign={'center'}
              style={{ marginTop: 8 }}
            >
              {azimuth ?? 0}º Azimuth
            </Label>
          </View>
        </View>

        <View style={{ marginTop: 'auto' }} />
        <Button
          text={'Entendi'}
          onPress={() => {
            navigation.goBack()
          }}
          color={theme.COLORS.WHITE}
          textColor={theme.COLORS.SECONDARY_900}
          border={theme.COLORS.SECONDARY_900}
        />
      </Container>
    </ScrollView>
  )
}
