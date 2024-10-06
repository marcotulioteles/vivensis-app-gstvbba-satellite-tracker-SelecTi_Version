import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Modal as ModalNative,
  ScrollView,
  View,
  TouchableOpacity,
  FlatList,
} from 'react-native'
import { Container } from './styles'
import { useTheme } from 'styled-components'
import { CheckIcon, ErrorIcon } from '~/assets/svgs'
import { Button } from '~/components/Button'
import { Label } from '~/components/Label/variants'
import { Input } from '~/components/Input'
import { normalize } from '~/utils'

interface IModalText {
  onChangeVisible: () => void
  transparent: boolean
  modalIsVisible: boolean
  message: string
  icon?: 'error' | 'success'
  loading: boolean
  buttonText?: string
  options?: { key: string; name: string }[]
  setState?: React.Dispatch<React.SetStateAction<string>>
  hasFilter?: boolean
}

export default function ModalOptions({
  onChangeVisible,
  transparent,
  modalIsVisible,
  message,
  icon,
  loading,
  buttonText,
  options,
  setState,
  hasFilter = false,
}: IModalText) {
  const theme = useTheme()

  const [optionsFiltered, setOptionsFiltered] = useState(options)
  const [firstTime, setFirstTime] = useState(true)

  const [filter, setFilter] = useState('')

  const handleClose = async () => {
    setFilter('')
    onChangeVisible()
  }

  useEffect(() => {
    if (firstTime) {
      const uniqueOptions: any = Array.from(new Set(options?.map((item) => item.key))).map(
        (key) => options?.find((item) => item.key === key) ?? []
      )
      setOptionsFiltered(uniqueOptions ?? [])
      setFirstTime(false)
      return
    }
    if (filter.length && options) {
      const filteredOptions = options?.filter((it) =>
        it.name.toLowerCase().includes(filter.toLowerCase())
      )
      const uniqueFilteredOptions: any = Array.from(
        new Set(filteredOptions?.map((item) => item.key))
      ).map((key) => filteredOptions.find((item) => item.key === key))
      setOptionsFiltered(uniqueFilteredOptions)
    } else {
      const uniqueOptions: any = Array.from(new Set(options?.map((item) => item.key))).map(
        (key) => options?.find((item) => item.key === key) ?? []
      )
      setOptionsFiltered(uniqueOptions)
    }
  }, [filter, firstTime, options])

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
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: 'transparent',
            flexBasis: '40%',
            alignItems: 'center',
          }}
          onPress={() => handleClose()}
        ></TouchableOpacity>
        <View
          style={{
            flexBasis: '60%',
            width: '100%',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            minHeight: loading ? 200 : normalize(450),
          }}
        >
          <Container>
            {loading ? (
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                <ActivityIndicator size='large' color={theme.COLORS.PRIMARY_400} />
                <Label
                  isBold
                  lineHeight={19}
                  fontSize={13}
                  textAlign={'center'}
                  style={{ marginTop: 32 }}
                >
                  Carregando...
                </Label>
              </ScrollView>
            ) : (
              <View style={{ flex: 1 }}>
                {icon === 'error' ? (
                  <ErrorIcon style={{ alignSelf: 'center', marginBottom: 24 }} />
                ) : null}
                {icon === 'success' ? (
                  <CheckIcon style={{ alignSelf: 'center', marginBottom: 24 }} />
                ) : null}
                <Label
                  isMedium
                  lineHeight={21}
                  fontSize={16}
                  textAlign={'left'}
                  style={{ marginBottom: 32 }}
                >
                  {message}
                </Label>
                {hasFilter && (
                  <Input placeholder={`Filtrar ${message}`} onChangeText={(e) => setFilter(e)} />
                )}
                <FlatList
                  data={optionsFiltered}
                  keyExtractor={(item) => item.key}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={() => {
                    return (
                      <Label color={theme.COLORS.PRIMARY_400} fontSize={15}>
                        Cidade não encontrada
                      </Label>
                    )
                  }}
                  style={{ maxHeight: normalize(230) }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={{
                        marginBottom: 8,
                        borderColor: theme.COLORS.PRIMARY_400,
                        borderWidth: 1,
                        paddingVertical: 8,
                        borderRadius: 8,
                      }}
                      onPress={() => {
                        if (setState) {
                          setState(item.name)
                        }
                        handleClose()
                      }}
                    >
                      <Label color={theme.COLORS.PRIMARY_400} fontSize={15}>
                        {item.name}
                      </Label>
                    </TouchableOpacity>
                  )}
                />
                {/* {optionsFiltered?.map((it) => (
                  <TouchableOpacity
                    key={it.key}
                    style={{
                      marginBottom: 8,
                      borderColor: theme.COLORS.PRIMARY_400,
                      borderWidth: 1,
                      paddingVertical: 8,
                      borderRadius: 8,
                    }}
                    onPress={() => {
                      if (setState) {
                        setState(it.name)
                      }
                      handleClose()
                    }}
                  >
                    <Label color={theme.COLORS.PRIMARY_400} fontSize={15}>
                      {it.name}
                    </Label>
                  </TouchableOpacity>
                ))} */}
                <Button
                  text={buttonText ? buttonText : 'Ok'}
                  onPress={() => {
                    onChangeVisible()

                    setFilter('')
                  }}
                />
              </View>
            )}
          </Container>
        </View>
      </View>
    </ModalNative>
  )
}
