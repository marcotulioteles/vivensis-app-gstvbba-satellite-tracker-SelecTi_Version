import React from 'react'

import { useTheme } from 'styled-components'

import Pdf from 'react-native-pdf'
import { Platform, ScrollView } from 'react-native'
import { Container } from './styles'
import { HeaderSecondary } from '~/components/HeaderSecondary'
import { Label } from '~/components/Label/variants/index'

export const LuckNumbersPdf = () => {
  const theme = useTheme()

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <HeaderSecondary title='Regulamento' />
      <Container>
        <Label style={{ marginBottom: 12 }}>
          Sorteio de responsabilidade ÚNICA da empresa VIVENIS INDUSTRIA E COMERCIO LTDA, conforme
          regulamento abaixo.
        </Label>
        <Pdf
          source={require('../documents/regulamento.pdf')}
          onLoadComplete={(numberOfPages, filePath) => {
            console.log(`Number of pages: ${numberOfPages}`)
          }}
          trustAllCerts={false}
          onPageChanged={(page, numberOfPages) => {
            console.log(`Current page: ${page}`)
          }}
          onError={(error) => {
            console.log(error)
          }}
          onPressLink={(uri) => {
            console.log(`Link pressed: ${uri}`)
          }}
          style={{ flex: 1 }}
        />
        {Platform.OS === 'ios' && (
          <Label style={{ marginBottom: 24, marginTop: 12 }}>
            Sorteio não patrocinado pela Apple
          </Label>
        )}
      </Container>
    </ScrollView>
  )
}
