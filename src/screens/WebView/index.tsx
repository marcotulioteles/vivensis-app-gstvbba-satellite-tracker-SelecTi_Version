import React, { useState } from 'react'

import { useTheme } from 'styled-components'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { ActivityIndicator, View } from 'react-native'

import { HeaderSecondary } from '~/components/HeaderSecondary'
import WebView from 'react-native-webview'

export const WebViewScreen = () => {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}
      contentContainerStyle={{ flex: 1 }}
    >
      <HeaderSecondary title='Lista de Canais' />
      {loading && (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size='large' color={theme.COLORS.PRIMARY_400} />
        </View>
      )}
      <View
        style={{
          flex: 1,
          marginTop: 14,
        }}
      >
        <WebView
          source={{ uri: 'https://www.vivensis.com.br/suporte/canais' }}
          style={{
            flex: 1,
          }}
          onLoadEnd={() => setLoading(false)}
        />
      </View>
    </KeyboardAwareScrollView>
  )
}
