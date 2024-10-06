import React from 'react'
import 'react-native-gesture-handler'
import 'intl'
import 'intl/locale-data/jsonp/pt-BR'
import AppLoading from 'expo-app-loading'
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native'
import { LogBox, View, StatusBar, Platform } from 'react-native'
import Constants from 'expo-constants'

import CodePush from 'react-native-code-push'

import { ThemeProvider } from 'styled-components/native'

import { useFonts } from 'expo-font'

import SpInAppUpdates, {
  NeedsUpdateResponse,
  IAUUpdateKind,
  StartUpdateOptions,
} from 'sp-react-native-in-app-updates'

import Routes from './routes'
import theme from './theme'
import { RootBottomTabParamList } from './routes'

LogBox.ignoreLogs(['Setting a timer'])

const inAppUpdates = new SpInAppUpdates(
  false // isDebug
)

function App() {
  const navigation = React.useRef<NavigationContainerRef<RootBottomTabParamList> | null>(null)

  const [fontsLoaded] = useFonts({
    'Poppins-Medium': require('./assets/fonts/Poppins-Medium.ttf'),
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Thin': require('./assets/fonts/Poppins-Thin.ttf'),
  })

  if (!fontsLoaded) {
    return <AppLoading />
  }

  inAppUpdates.checkNeedsUpdate().then((result) => {
    if (result.shouldUpdate) {
      let updateOptions: StartUpdateOptions = {}
      if (Platform.OS === 'android') {
        // android only, on iOS the user will be promped to go to your app store page
        updateOptions = {
          updateType: IAUUpdateKind.IMMEDIATE,
        }
      }
      inAppUpdates.startUpdate(updateOptions) // https://github.com/SudoPlz/sp-react-native-in-app-updates/blob/master/src/types.ts#L78
    }
  })

  return (
    <ThemeProvider theme={theme}>
      <View
        style={{
          height: Platform.OS === 'ios' ? Constants.statusBarHeight : 0,
          backgroundColor: theme.COLORS.WHITE,
        }}
      >
        <StatusBar backgroundColor={theme.COLORS.WHITE} barStyle='dark-content' />
      </View>
      <NavigationContainer ref={navigation}>
        <Routes />
      </NavigationContainer>
    </ThemeProvider>
  )
}

//TODO: Verificar impacto
export default (__DEV__ ? App : CodePush({
  checkFrequency: CodePush.CheckFrequency.ON_APP_RESUME,
})(App));
