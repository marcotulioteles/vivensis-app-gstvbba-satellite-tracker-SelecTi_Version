import React, { useCallback, useEffect, useState } from 'react'

import { useTheme } from 'styled-components'

import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Linking,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native'
import { Container } from './styles'
import { HeaderSecondary } from '~/components/HeaderSecondary'
import { cpfMask, normalize } from '~/utils'
import { Label } from '~/components/Label/variants/index'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Input } from '~/components/Input'
import { Line } from '~/components/Containers/styles'
import { IconStyled } from '../Home/styles'
import ModalFilter, { IFilter } from '~/components/ModalFilter'
import api from '~/services/api'
import { AxiosRequestConfig } from 'axios'
import { TOKEN } from '@env'
import ModalInfo from '~/components/ModalInfo'
import { Button } from '~/components/Button'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type ILuckNumber = {
  caid: string
  data_ativacao: string
  serie: string
  numero_sorte: string
  mes_sorteio: string
  document?: string
}

type ILuckMonth = {
  data: ILuckNumber[]
  mes_sorteio: string
}

export const LuckNumbers = () => {
  const theme = useTheme()
  const navigation = useNavigation()
  const [modalFilter, setModalFilter] = useState(false)
  const [filters, setFilters] = useState<IFilter>()
  const [loading, setLoading] = useState(false)
  const [luckNumbersMonth, setLuckNumbersMonth] = useState<ILuckMonth[]>([])
  const [cpf, setCpf] = useState('')
  const [textModal, setTextModal] = useState('')
  const [icon, setIcon] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)

  function formatMonth(monthYear: string) {
    const monthsMap: any = {
      JAN: 'Janeiro',
      FEV: 'Fevereiro',
      MAR: 'Março',
      ABR: 'Abril',
      MAI: 'Maio',
      JUN: 'Junho',
      JUL: 'Julho',
      AGO: 'Agosto',
      SET: 'Setembro',
      OUT: 'Outubro',
      NOV: 'Novembro',
      DEZ: 'Dezembro',
    }

    const [monthCode, year] = monthYear.split('/')
    const monthName = monthsMap[monthCode.toUpperCase()]

    return `${monthName} de ${year}`
  }

  function groupByMonth(data: ILuckNumber[]) {
    const groups: any = {}

    data.forEach((item) => {
      const month: any = item.mes_sorteio
      if (!groups[month]) {
        groups[month] = []
      }
      groups[month].push(item)
    })

    return groups
  }

  function removerCaracteresEspeciaisCPF(cpf: string): string {
    return cpf.replace(/[.-]/g, '')
  }

  useEffect(() => {
    // Retrieve stored CPF on component mount
    AsyncStorage.getItem('cpfInstalador').then((storedCpf) => {
      if (storedCpf) {
        setCpf(storedCpf)
      }
    })
  }, [])

  useFocusEffect(
    useCallback(() => {
      const getLuckNumbers = async () => {
        if (cpf?.length < 14) return
        try {
          setLoading(true)
          const config: AxiosRequestConfig = {
            headers: {
              Authorization: `Bearer ${TOKEN}`,
            },
          }
          // 02274530505
          const response = await api.get(
            `numeros_sorte?cpf=${removerCaracteresEspeciaisCPF(cpf)}`,
            config
          )

          const groupedData = groupByMonth(response.data.dados)
          const dataSource = Object.keys(groupedData).map((month) => ({
            mes_sorteio: formatMonth(month),
            data: groupedData[month],
          }))
          setLuckNumbersMonth(dataSource)
          setLoading(false)
        } catch (er: any) {
          setTextModal(er.response?.data?.mensagem || '')
          setIcon(false)
          if (er.response?.status === 500) {
            setTextModal('Houve um erro interno')
          }
          if (er.response?.status === 404) {
            setTextModal('O CPF não possui números da sorte')
          }
          setLoading(false)
          setModalVisible(true)
        }
      }
      getLuckNumbers()
    }, [cpf])
  )

  return loading ? (
    <View style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}>
      <HeaderSecondary title='Números da Sorte' />
      <Container>
        <ActivityIndicator size='large' color={theme.COLORS.PRIMARY_400} />
      </Container>
    </View>
  ) : (
    <View style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}>
      <HeaderSecondary title='Números da Sorte' action={() => setModalFilter(true)} />
      <Container>
        <View style={{ marginBottom: 24 }}>
          <Line marginTop={20}>
            <Label fontSize={14} textAlign='left' color={theme.COLORS.PRIMARY_500}>
              CPF
            </Label>
          </Line>

          <Input
            placeholder={'Informe o seu CPF'}
            accessibilityLabel={'Informe o seu CPF'}
            testID='cpf'
            defaultValue=''
            value={cpf}
            hasValidation
            autoCorrect={false}
            maxLength={14}
            onChangeText={(e) => {
              setCpf(cpfMask(e))
            }}
            label='CPF'
            errorText='CPF inválido'
          />

          {!loading && cpf?.length === 14 && !luckNumbersMonth.length ? (
            <View
              style={{
                flex: 1,
                minHeight: '80%',
              }}
            >
              <View style={{ marginTop: 24 }}>
                <Label
                  textAlign='left'
                  fontSize={14}
                  color={theme.COLORS.TEXT}
                  lineHeight={21}
                  isMedium
                >
                  Nenhum número encontrado para o CPF informado
                </Label>
              </View>
              <View
                style={{
                  marginTop: 'auto',
                }}
              >
                <Button
                  onPress={() => navigation.goBack()}
                  text='Fechar'
                  color={theme.COLORS.SECONDARY_400}
                />
              </View>
            </View>
          ) : null}
          <FlatList
            data={luckNumbersMonth}
            keyExtractor={(item) => `${item.mes_sorteio}`}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={() => (
              <View style={{ marginTop: 24, marginBottom: 50 }}>
                {luckNumbersMonth?.length > 0 && (
                  <Button
                    onPress={() => navigation.goBack()}
                    text='Fechar'
                    color={theme.COLORS.SECONDARY_400}
                  />
                )}
              </View>
            )}
            contentContainerStyle={{ paddingBottom: normalize(120) }}
            renderItem={({ item: itemMonth }) => {
              return (
                <View>
                  <Label
                    textAlign='left'
                    fontSize={17}
                    isMedium
                    color={theme.COLORS.TEXT}
                    lineHeight={26}
                    style={{ marginBottom: 12, marginTop: 12 }}
                  >
                    {itemMonth.mes_sorteio}
                  </Label>
                  <FlatList
                    data={itemMonth.data}
                    keyExtractor={(item) => `${item.numero_sorte}`}
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
                          onPress={() =>
                            navigation.navigate('LuckNumbersShow', {
                              luckNumber: { ...item, document: cpf },
                            })
                          }
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
                              <Label
                                textAlign='left'
                                fontSize={14}
                                color={theme.COLORS.PRIMARY_400}
                                lineHeight={21}
                              >
                                {item.mes_sorteio.split('/')[0]}
                              </Label>
                              <Label
                                textAlign='left'
                                fontSize={17}
                                isMedium
                                color={theme.COLORS.PRIMARY_400}
                                lineHeight={26}
                              >
                                {item.data_ativacao.split('/')[0]}
                              </Label>
                            </View>
                            <View>
                              <Label
                                textAlign='left'
                                fontSize={16}
                                color={theme.COLORS.PRIMARY_500}
                                lineHeight={25}
                              >
                                CAID {item.caid}
                              </Label>
                              <Label
                                textAlign='left'
                                isMedium
                                fontSize={16}
                                color={theme.COLORS.PRIMARY_500}
                                lineHeight={25}
                              >
                                Número {item.numero_sorte}
                              </Label>
                            </View>
                            <View
                              style={{
                                position: 'absolute',
                                right: 0,
                                top: 0,
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
              )
            }}
          />
        </View>
        <TouchableOpacity
          style={{
            paddingTop: normalize(12),
            paddingBottom: normalize(12),
            backgroundColor: theme.COLORS.GRAY_03,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            bottom: 0,
            width: Dimensions.get('window').width,
          }}
          onPress={() => {
            if (Platform.OS === 'ios') {
              navigation.navigate('LuckNumbersPdf')
            } else {
              Linking.openURL('https://sorteiodossonhosvivensis.com.br/#regulamento')
            }
          }}
        >
          <Label isMedium color={theme.COLORS.SECONDARY_900} fontSize={13}>
            Termos e Regulamentos da Campanha
          </Label>
          <IconStyled
            style={{ marginLeft: 8 }}
            name='arrow-right'
            size={24}
            color={theme.COLORS.SECONDARY_900}
          />
        </TouchableOpacity>
        <ModalFilter
          transparent
          loading={false}
          filter={filters}
          onChangeVisible={() => setModalFilter(false)}
          modalIsVisible={modalFilter}
          message=''
          title='Filtrar Orçamentos'
          setFilters={setFilters}
        />
        <ModalInfo
          transparent
          loading={false}
          modalIsVisible={modalVisible}
          title={'Atenção'}
          onChangeVisible={() => {
            setModalVisible(false)
          }}
          message={textModal}
          buttonText='Voltar'
          icon={icon ? 'success' : 'alert'}
          hasButtonCpf={false}
          hiddenBorder
        />
      </Container>
    </View>
  )
}
