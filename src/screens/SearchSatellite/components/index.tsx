import React, { useEffect, useState } from 'react'
import {
  Modal as ModalNative,
  ScrollView,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
} from 'react-native'
import { useTheme } from 'styled-components'
import { Button } from '~/components/Button'
import { Label } from '~/components/Label/variants'
import { IconStyled } from '~/screens/Home/styles'
import { normalize } from '~/utils'
import AsyncStorage from '@react-native-async-storage/async-storage'

const initialInstructions = [
  {
    description: 'Calibre a bússola fazendo o movimento de infinito com o celular!',
    img: require('./images/01.gif'),
  },
  {
    description: 'Mantenha o aparelho longe de imãs para não influenciar na medição!',
    img: require('./images/02.png'),
  },
  {
    description: 'Posicione o aparelho na vertical!',
    img: require('./images/03.png'),
  },
  {
    description: 'Mexa-se lentamente para melhorar a precisão!',
    img: require('./images/04.png'),
  },
]

interface IModalInstructions {
  onChangeVisible: () => void
  transparent: boolean
  modalIsVisible: boolean
  instructionsArr?: any[]
  hasInstructions?: boolean
}

export default function ModalInstructions({
  onChangeVisible,
  transparent,
  modalIsVisible,
  instructionsArr,
  hasInstructions,
}: IModalInstructions) {
  const theme = useTheme()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [instructions, setInstructions] = useState(
    instructionsArr?.length ? instructionsArr : initialInstructions
  )

  const handleNext = () => {
    if (currentIndex < instructions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      onChangeVisible()
      setCurrentIndex(0)
    }
  }

  const handleSkip = async () => {
    if (hasInstructions) return
    const updatedInstructions = instructions.filter((_, index) => index !== currentIndex)
    setInstructions(updatedInstructions)

    if (updatedInstructions.length > 0) {
      setCurrentIndex(
        currentIndex >= updatedInstructions.length ? updatedInstructions.length - 1 : currentIndex
      )
    } else {
      onChangeVisible()
    }
  }

  useEffect(() => {
    if (hasInstructions) return
    const loadInstructions = async () => {
      const storedInstructions = await AsyncStorage.getItem('skippedInstructions')
      if (storedInstructions) {
        const parsedInstructions = JSON.parse(storedInstructions)
        setInstructions(parsedInstructions)
      }
    }
    loadInstructions()
  }, [instructionsArr])

  if (instructions.length === 0) {
    return null
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
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            height: normalize(540),
            backgroundColor: theme.COLORS.WHITE,
            padding: normalize(24),
          }}
        >
          <TouchableOpacity
            onPress={onChangeVisible}
            style={{
              alignSelf: 'flex-end',
            }}
          >
            <IconStyled size={30} name='close' />
          </TouchableOpacity>

          <Label
            isBold
            lineHeight={29}
            fontSize={20}
            textAlign={'center'}
            style={{ marginBottom: 16 }}
          >
            Instruções de uso
          </Label>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {instructions[currentIndex] && (
              <>
                <Label
                  lineHeight={25}
                  fontSize={16}
                  textAlign={'center'}
                  style={{ marginVertical: 16 }}
                  color={theme.COLORS.TEXT}
                >
                  {instructions[currentIndex].description}
                </Label>
                <Image
                  source={instructions[currentIndex].img}
                  style={{ width: '100%', height: normalize(180), resizeMode: 'contain' }}
                />
              </>
            )}
          </ScrollView>

          {/* <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16 }}>
            {instructions.map((_, index) => (
              <View
                key={index}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor:
                    index === currentIndex ? theme.COLORS.SECONDARY_900 : theme.COLORS.GRAY_03,
                  marginHorizontal: normalize(5),
                }}
              />
            ))}
          </View> */}

          <Button
            text={currentIndex === instructions.length - 1 ? 'Fechar' : 'Entendi'}
            onPress={handleNext}
            color={theme.COLORS.WHITE}
            textColor={theme.COLORS.SECONDARY_900}
            border={theme.COLORS.SECONDARY_900}
          />

          {!hasInstructions && (
            <TouchableOpacity
              style={{
                paddingTop: normalize(12),
                paddingBottom: normalize(12),
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 12,
              }}
              onPress={handleSkip}
            >
              <Label isMedium color={theme.COLORS.SECONDARY_900} fontSize={13}>
                Não mostrar novamente!
              </Label>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ModalNative>
  )
}
