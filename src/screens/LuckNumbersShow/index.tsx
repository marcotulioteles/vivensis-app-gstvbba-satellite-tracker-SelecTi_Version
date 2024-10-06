import React from 'react'

import { useTheme } from 'styled-components'

import { ScrollView, View } from 'react-native'
import { Container } from './styles'
import { HeaderSecondary } from '~/components/HeaderSecondary'
import { Label } from '~/components/Label/variants/index'
import { Line } from '~/components/Containers/styles'
import { RootBottomTabParamList } from '~/routes'
import { RouteProp, useRoute } from '@react-navigation/native'

type LuckNumberShowRouteProp = RouteProp<RootBottomTabParamList, 'LuckNumbersShow'>
export const LuckNumbersShow = () => {
  const route = useRoute<LuckNumberShowRouteProp>()
  const theme = useTheme()
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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <HeaderSecondary title='Detalhe do número' />
      <Container>
        <View style={{ marginBottom: 24 }}>
          <Line marginTop={20}>
            <Label fontSize={14} textAlign='left' color={theme.COLORS.DARK_GRAY}>
              Mês Sorteio
            </Label>
          </Line>
          <Label fontSize={16} textAlign='left' color={theme.COLORS.TITLE}>
            {formatMonth(route.params.luckNumber.mes_sorteio)}
          </Label>
          <Line marginTop={20}>
            <Label fontSize={14} textAlign='left' color={theme.COLORS.DARK_GRAY}>
              CAID
            </Label>
          </Line>
          <Label fontSize={16} textAlign='left' color={theme.COLORS.TITLE}>
            {route.params.luckNumber.caid}
          </Label>
          <Line marginTop={20}>
            <Label fontSize={14} textAlign='left' color={theme.COLORS.DARK_GRAY}>
              Data Ativação
            </Label>
          </Line>
          <Label fontSize={16} textAlign='left' color={theme.COLORS.TITLE}>
            {route.params.luckNumber.data_ativacao}
          </Label>
          <Line marginTop={20}>
            <Label fontSize={14} textAlign='left' color={theme.COLORS.DARK_GRAY}>
              Número da Sorte
            </Label>
          </Line>
          <Label fontSize={16} textAlign='left' color={theme.COLORS.TITLE}>
            {route.params.luckNumber.numero_sorte}
          </Label>
          <Line marginTop={20}>
            <Label fontSize={14} textAlign='left' color={theme.COLORS.DARK_GRAY}>
              CPF do Instalador
            </Label>
          </Line>
          <Label fontSize={16} textAlign='left' color={theme.COLORS.TITLE}>
            {route.params.luckNumber?.document}
          </Label>
        </View>
      </Container>
    </ScrollView>
  )
}
