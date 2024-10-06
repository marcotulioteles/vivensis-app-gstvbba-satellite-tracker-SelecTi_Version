import React from 'react'
import { KeyboardAvoidingView } from 'react-native'

import { Platform } from 'react-native'

export const KeyboardAvoindViewIOSAndroid = ({ children }: any) => {
  return Platform.OS === 'ios' ? (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      behavior='padding'
    >
      {children}
    </KeyboardAvoidingView>
  ) : (
    <>{children}</>
  )
}
