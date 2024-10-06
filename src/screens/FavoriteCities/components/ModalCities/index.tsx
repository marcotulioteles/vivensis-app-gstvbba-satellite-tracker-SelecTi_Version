import React, { useEffect, useState } from 'react'
import { Dimensions, FlatList, Modal as ModalNative, TouchableOpacity, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Container, Content } from './styles'
import { useTheme } from 'styled-components'
import { Button } from '~/components/Button'
import { normalize } from '~/utils'
import { HeaderSecondary } from '~/components/HeaderSecondary'
import { Line } from '~/components/Containers/styles'
import { Text } from '~/components/Label/styles'
import { IconDark } from '~/components/Icons/styles'

interface IModalText {
  onChangeVisible: () => void
  transparent: boolean
  modalIsVisible: boolean
}

export default function ModalCities({ onChangeVisible, transparent, modalIsVisible }: IModalText) {
  const theme = useTheme()
  const [cities, setCities] = useState<
    {
      city: { city: string; id: string }
      state: string
    }[]
  >([])

  const handleClose = async () => {
    onChangeVisible()
  }

  const deleteCity = async (targetCity: string, targetState: string) => {
    const updatedCities = cities.filter((cityObj) => {
      return !(cityObj.city === targetCity && cityObj.state === targetState)
    })

    setCities(updatedCities)

    await AsyncStorage.setItem('dataList', JSON.stringify(updatedCities))
  }

  const getData = async () => {
    let dataList = []

    const storedData = await AsyncStorage.getItem('dataList')
    if (storedData) {
      dataList = JSON.parse(storedData)
    }
    setCities(dataList)
  }

  useEffect(() => {
    getData()
  }, [])

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
          height: Dimensions.get('window').height,
        }}
      >
        <View
          style={{
            width: '100%',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            height: Dimensions.get('window').height,
          }}
        >
          <Container>
            <HeaderSecondary
              title='Lista de cidades'
              hasAnotherAction
              handleLeftAction={onChangeVisible}
            />
            <Content>
              {cities?.length ? (
                <FlatList
                  showsVerticalScrollIndicator={false}
                  data={[...cities]}
                  contentContainerStyle={{ paddingBottom: 120 }}
                  renderItem={({ item, index }) => (
                    <Line
                      key={`${item.city}-${item.state}-${index}`}
                      style={{
                        marginTop: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: '#ebebeb',
                        paddingBottom: 12,
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>
                        {item.city}/{item.state}
                      </Text>
                      <TouchableOpacity
                        style={{ marginLeft: 'auto' }}
                        onPress={async () => {
                          deleteCity(item.city, item.state)
                        }}
                      >
                        <IconDark name='delete-outline' size={24} />
                      </TouchableOpacity>
                    </Line>
                  )}
                  keyExtractor={(item, index) => `${index}`}
                />
              ) : (
                <Text style={{ fontSize: 16, textAlign: 'center' }}>
                  Você ainda não cadastrou nenhuma cidade favorita.
                </Text>
              )}
              <View
                style={{
                  position: 'absolute',
                  bottom: normalize(40),
                  left: normalize(24),
                  width: '100%',
                }}
              >
                <Button
                  text='Voltar'
                  disabled={false}
                  onPress={handleClose}
                  color={theme.COLORS.SECONDARY_400}
                />
              </View>
            </Content>
          </Container>
        </View>
      </View>
    </ModalNative>
  )
}
