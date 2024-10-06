import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import { Home, SubmitData } from '~/screens/Home'
import { Activate } from '~/screens/Activate'
import { Signal } from '~/screens/Signal'
import { Guarantee } from '~/screens/Guarantee'
import { FavoriteCities } from '~/screens/FavoriteCities'
import { ActivateOffline } from '~/screens/ActivateOffline'
import { SendActivate } from '~/screens/SendActivate'
import { AntennaSize } from '~/screens/AntennaSize'
import { Budget } from '~/screens/Budget'
import { Budget as IBudget, BudgetNew } from '~/screens/BudgetNew'
import { PDFBudget } from '~/screens/PDFBudget'
import { WebViewScreen } from '~/screens/WebView'
import { RegisterTechnician } from '~/screens/RegisterTechnician'
import { ILuckNumber, LuckNumbers } from '~/screens/LuckNumbers'
import { LuckNumbersShow } from '~/screens/LuckNumbersShow'
import { LuckNumbersPdf } from '~/screens/LuckNumbers/LuckNumbersPdf'
import { CollectiveCalculation } from '~/screens/CollectiveCalculation'
import { NewCollectiveCalculation } from '~/screens/NewCollectiveCalculation'
import { SearchSatellite } from '~/screens/SearchSatellite'
import { SearchSatelliteCamera } from '~/screens/SearchSatellite/SearchSatelliteCamera'
import { IMessagesList, Messages } from '~/screens/Messages'
import { SearchSatelliteRA } from '~/screens/SearchSatellite/SearchSatelliteRA/Index'
import { SatelliteTrackerCamera } from '~/screens/SatelliteTracker'

export type RootBottomTabParamList = {
  Dashboard: undefined
  Activate: undefined
  Signal: undefined
  Guarantee: undefined
  FavoriteCities: undefined
  ActivateOffline: undefined
  SendActivate: { item: SubmitData }
  AntennaSize: undefined
  Budget: undefined
  BudgetNew: {
    budget: IBudget | undefined
  }
  PDFBudget: {
    budget: IBudget
  }
  WebViewScreen: undefined
  RegisterTechnician: {
    document: string
  }
  LuckNumbers: undefined
  LuckNumbersShow: {
    luckNumber: ILuckNumber
  }
  LuckNumbersPdf: undefined
  CollectiveCalculation: undefined
  NewCollectiveCalculation?: {
    id?: string
  }
  SearchSatellite: undefined
  SearchSatelliteCamera: {
    title: string
    data: { tleLine1: string; tleLine2: string }
  }
  SearchSatelliteRA: {
    title: string
    data: { tleLine1: string; tleLine2: string }
  }
  SatelliteTrackerCamera: {
    title: string
    data: { tleLine1: string; tleLine2: string }
  }
  Messages: {
    token: string
    messages: IMessagesList[]
    idIntern: string
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface RootParamList extends RootBottomTabParamList {}
  }
}

const App = createStackNavigator()

const AppRoutes = () => {
  return (
    <App.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <App.Screen name='Home' component={Home} />
      <App.Screen name='Activate' component={Activate} />
      <App.Screen name='Signal' component={Signal} />
      <App.Screen name='Guarantee' component={Guarantee} />
      <App.Screen name='FavoriteCities' component={FavoriteCities} />
      <App.Screen name='ActivateOffline' component={ActivateOffline} />
      <App.Screen name='SendActivate' component={SendActivate} />
      <App.Screen name='AntennaSize' component={AntennaSize} />
      <App.Screen name='Budget' component={Budget} />
      <App.Screen name='BudgetNew' component={BudgetNew} />
      <App.Screen name='PDFBudget' component={PDFBudget} />
      <App.Screen name='WebViewScreen' component={WebViewScreen} />
      <App.Screen name='RegisterTechnician' component={RegisterTechnician} />
      <App.Screen name='LuckNumbers' component={LuckNumbers} />
      <App.Screen name='LuckNumbersShow' component={LuckNumbersShow} />
      <App.Screen name='LuckNumbersPdf' component={LuckNumbersPdf} />
      <App.Screen name='CollectiveCalculation' component={CollectiveCalculation} />
      <App.Screen name='NewCollectiveCalculation' component={NewCollectiveCalculation} />
      <App.Screen name='SearchSatellite' component={SearchSatellite} />
      <App.Screen name='SearchSatelliteCamera' component={SearchSatelliteCamera} />
      <App.Screen name='SearchSatelliteRA' component={SearchSatelliteRA} />
      <App.Screen name='SatelliteTrackerCamera' component={SatelliteTrackerCamera} />
      <App.Screen name='Messages' component={Messages} />
    </App.Navigator>
  )
}

const Routes = () => {
  return <AppRoutes />
}

export default Routes
