import React, { useState } from 'react'

import { useTheme } from 'styled-components'
import Torch from 'react-native-torch'

import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions'

import { FlatList, Platform, TouchableOpacity, View } from 'react-native'
import { Container } from './styles'
import { HeaderSecondary } from '~/components/HeaderSecondary'
import { normalize } from '~/utils'
import { Label } from '~/components/Label/variants/index'
import { useNavigation } from '@react-navigation/native'
import { Line } from '~/components/Containers/styles'
import { IconStyled } from '../Home/styles'
import ClaroIcon from '~/assets/svgs/ClaroIcon'
import SKYIcon from '~/assets/svgs/SKYIcon'
import { AlertIconOutline } from '~/assets/svgs'
import ModalInstructions from './components'
import AsyncStorage from '@react-native-async-storage/async-storage'

const initialInstructions = [
  {
    description: 'Calibre a bússola fazendo o movimento de infinito com o celular!',
    img: require('./components/images/01.gif'),
  },
  {
    description: 'Mantenha o aparelho longe de imãs para não influenciar na medição!',
    img: require('./components/images/02.png'),
  },
  {
    description: 'Posicione o aparelho na vertical!',
    img: require('./components/images/03.png'),
  },
  {
    description: 'Mexa-se lentamente para melhorar a precisão!',
    img: require('./components/images/04.png'),
  },
]

export const SearchSatellite = () => {
  const theme = useTheme()
  const navigation = useNavigation()
  const [modalInstructions, setModalInstructions] = useState(false)
  const [instructions, setInstructions] = useState<any[]>([])

  const loadInstructions = async () => {
    const storedInstructions = await AsyncStorage.getItem('skippedInstructions')
    if (storedInstructions) {
      const parsedInstructions = JSON.parse(storedInstructions)
      setInstructions(parsedInstructions)
    } else {
      setInstructions(initialInstructions)
    }
  }

  const handleOpenInstructions = async () => {
    await loadInstructions()
    setModalInstructions(true)
  }

  async function handleTorchAndNavigate(item: any) {
    try {
      if (Platform.OS === 'ios') {
        Torch.switchState(false)
      } else {
        const cameraAllowed = await Torch.requestCameraPermission(
          'Permissão de câmera',
          'Precisamos de acesso à sua câmera para garantir uma experiência visual mais agradável e otimizada!'
        )

        if (cameraAllowed) {
          Torch.switchState(false)
        }
      }
    } catch (er) {
      console.warn('Torch or Permission error: ', er)
    } finally {
      // navigation.navigate('SearchSatelliteCamera', {
      //   title: item.title,
      //   data: item.data,
      // })
      navigation.navigate('SearchSatelliteRA', {
        title: item.title,
        data: item.data,
      })
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}>
      <HeaderSecondary title='Localizar Satélite' />
      <Container>
        <View style={{ marginBottom: 24 }}>
          <View style={{ marginTop: 24, marginBottom: 16 }}>
            <Label
              textAlign='left'
              fontSize={16}
              color={theme.COLORS.TEXT}
              lineHeight={25}
              isMedium
            >
              Selecione o tipo de satélite que deseja localizar
            </Label>
          </View>

          <FlatList
            data={[
              {
                id: 'claro',
                title: 'Claro',
                image: <ClaroIcon />,
                data: {
                  tleLine1: '1 40733U 15034B   24175.36725698 -.00000252  00000+0  00000+0 0  9993',
                  tleLine2: '2 40733   0.0230  20.1780 0002189  50.1079 263.9484  1.00270215 32766',
                },
              },
              {
                id: 'sky',
                title: 'SKY',
                image: <SKYIcon />,
                data: {
                  tleLine1: '1 41945U 17007B   24189.82757102 -.00000272  00000+0  00000+0 0  9994',
                  tleLine2: '2 41945   0.0190  31.8601 0000797 317.1935 191.9612  1.00273071 27139',
                },
              },
            ]}
            keyExtractor={(item) => `${item.id}`}
            ListFooterComponent={() => (
              <TouchableOpacity
                style={{ marginTop: normalize(40), flexDirection: 'row', alignItems: 'center' }}
                onPress={async () => {
                  await AsyncStorage.removeItem('skippedInstructions')
                  await handleOpenInstructions()
                  setInstructions(initialInstructions)
                  setModalInstructions(true)
                }}
              >
                <Label
                  textAlign='left'
                  fontSize={16}
                  color={theme.COLORS.TEXT}
                  lineHeight={25}
                  isMedium
                >
                  Acessar instruções de uso
                </Label>
                <AlertIconOutline
                  color={theme.COLORS.TEXT}
                  width={normalize(18)}
                  height={normalize(18)}
                  style={{ marginLeft: normalize(16) }}
                />
              </TouchableOpacity>
            )}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity
                  style={{
                    borderWidth: 1,
                    borderColor: theme.COLORS.GRAY_08,
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 8,
                  }}
                  onPress={async () => {
                    try {
                      await handleTorchAndNavigate(item)
                    } catch (er) {
                      console.log(er)
                    }
                  }}
                >
                  <Line>
                    <View
                      style={{
                        backgroundColor: theme.COLORS.GRAY_ICE_GRAY,
                        borderRadius: 4,
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 50,
                        height: 50,
                        marginRight: 16,
                      }}
                    >
                      {item.image}
                    </View>
                    <View>
                      <Label
                        textAlign='left'
                        fontSize={16}
                        color={theme.COLORS.PRIMARY_500}
                        lineHeight={25}
                      >
                        Satélite{' '}
                        <Label
                          isBold
                          textAlign='left'
                          fontSize={16}
                          color={theme.COLORS.PRIMARY_500}
                          lineHeight={25}
                        >
                          {item.title}
                        </Label>
                      </Label>
                    </View>
                    <View
                      style={{
                        marginLeft: 'auto',
                      }}
                    >
                      <View>
                        <IconStyled
                          name='arrow-right'
                          color={theme.COLORS.PRIMARY_400}
                          size={normalize(18)}
                        />
                      </View>
                    </View>
                  </Line>
                </TouchableOpacity>
              )
            }}
          />
        </View>
      </Container>
      <ModalInstructions
        onChangeVisible={() => setModalInstructions(false)}
        transparent
        modalIsVisible={modalInstructions}
        instructionsArr={instructions}
        hasInstructions
      />
    </View>
  )
}
