import React, { useEffect, useState } from 'react'

import { useTheme } from 'styled-components'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { ActivityIndicator, Dimensions, View } from 'react-native'
import { Container } from './styles'
import RNHTMLtoPDF from 'react-native-html-to-pdf'
import Pdf from 'react-native-pdf'

import { HeaderSecondary } from '~/components/HeaderSecondary'

import { RouteProp, useRoute } from '@react-navigation/native'
import { RootBottomTabParamList } from '~/routes'
import { format } from 'date-fns'

type PDFBudgetScreenRouteProp = RouteProp<RootBottomTabParamList, 'PDFBudget'>

export const PDFBudget = () => {
  const theme = useTheme()

  const [techName, setTechName] = useState('')

  const route = useRoute<PDFBudgetScreenRouteProp>()

  const [uriPdf, setUriPdf] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (techName) loadPDF()
  }, [techName])

  useEffect(() => {
    async function loadTechName() {
      const response = await AsyncStorage.getItem('@techName')
      if (response) {
        setTechName(response)
      }
    }
    loadTechName()
  }, [])

  const sharePDF = async (fileUri: string) => {
    if (!(await Sharing.isAvailableAsync())) {
      alert(`Uh oh, sharing isn't available on your platform`)
      return
    }
    await Sharing.shareAsync(fileUri)
  }

  const generateHTML = (pages: any) => {
    let htmlContent = ''

    pages.forEach((page: any, pageIndex: any) => {
      const isLastPage = pageIndex === pages.length - 1

      htmlContent += `
      <div class="containerSecond">
        <img src="http://vxapp.vivensis2.com.br/files/02.jpg" class="image"/>
        <div class="line">
          <div class="column-top">
            <span class="header-value">${route.params.budget.name}</span>
          </div>
          <div class="column-top-second">
            <span class="header-value">${format(
              new Date(Number(route.params.budget.id)),
              'dd/MM/yyyy'
            )}</span>
          </div>
        </div>
        <div class="content">
          <table>`

      page.forEach((item: any) => {
        htmlContent += `<tr>
        <td class="description" style="font-size: 12px;  color: #000; ${
          item.description ? 'border-bottom: none;' : ''
        }">${`<p class="description"
        >${item.name}</p>`}</td>
        <td  class="quantity" style="font-size: 12px; color: #000; ${
          item.description ? 'border-bottom: none;' : ''
        }">${item.quantity}</td>
        <td class="price" style="font-size: 12px; color: #000;${
          item.description ? 'border-bottom: none;' : ''
        }">${Number(item.price).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })}</td>
        <td class="total" style="font-size: 12px; color: #000; ${
          item.description ? 'border-bottom: none;' : ''
        }">${(Number(item.price) * Number(item.quantity)).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })}</td>
      </tr>
      <tr>
        <td class="description" style="font-size: 10px; width: 100%; color: #000;  padding-top: 0;">${`<p class="description"
        style="word-break: break-word;"
        >${item.description ? `${item.description}` : ''}</p>`}
       </td>
        <td class="quantity" style="font-size: 10px; color: #000;  padding-top: 0;"></td>
        <td class="price" class="valor" style="font-size: 10px; color: #000; padding-top: 0;"></td>
        <td class="total" class="valor" style="font-size: 10px; color: #000;  padding-top: 0;"></td>
      </tr>
     
      `
      })

      htmlContent += `
          </table>
          ${
            isLastPage
              ? `
            <div style="padding: 10px 0 30px 0; border-bottom: 1px solid #F3F4F6;  
            display: flex; flex-direction: row; align-items: center; 
            justify-content: space-between; z-index: 100000000 !important;
            ">
              <span style="font-size: 12px; font-weight: 500">Valor total</span>
              <span style="color: #2A7287; font-size: 12px;">${page
                .reduce((acc: any, item: any) => {
                  acc += Number(item.price) * Number(item.quantity)
                  return acc
                }, 0)
                .toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}</span>
            </div>`
              : ''
          }
          </div>`

      htmlContent += `
        <div class="footer">
          ${techName ? `<span class="header-value">${techName}</span>` : ''}
        </div>
      </div>`
    })
    return htmlContent
  }

  const loadPDF = async () => {
    setLoading(true)
    try {
      const products = route.params.budget.products

      let currentPageLines = 0
      let currentPageItems: any = []
      let pages = []

      const calculateLinesForProduct = (product: any) => {
        let lines = 2

        if (product.description) {
          lines += Math.ceil(product.description.length / 45)
        }

        return lines
      }

      products.forEach((product) => {
        const productLines = calculateLinesForProduct(product)

        if (currentPageLines + productLines > 20) {
          pages.push(currentPageItems)

          currentPageItems = []
          currentPageLines = 0
        }

        currentPageItems.push(product)
        currentPageLines += productLines
      })

      if (currentPageItems.length > 0) {
        pages.push(currentPageItems)
      }

      const fileName = `budget-${new Date().getTime()}`
      let options = {
        html: `<html lang="pt">
        <head>
        <meta charset="UTF-8"><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
        <title>Orçamento Detalhado</title>
        <style>
          body {
            font-family: 'Poppins', Inter, Arial, sans-serif;
            background: #f8f8f8;
            color: #333;
            width: 100%;
          }
          .imgBg {
            background-color: #07133d;
            width: 100%;
          }
          .imgBg img {
            height: 100%;
            background-color: #07133d;
            width: 100%;
            object-fit: contain;
          }
          .containerImg{
            background: #fff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            height: 100.9%;
            position: relative;
          }
          .container {
            width: 100%;
            min-width: 100%;
            background: #fff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            height: 100%;
            position: relative;
          }
          .containerSecond {
            width: 100%;
            min-width: 100%;
            background: #fff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            height: 100%;
            position: relative;
            margin-top: 2%;
          }
          .image {
            width: 100%;
            min-width:  100%;
            background: #fff;
            height: 100%;
            position: absolute;
            z-index: 1;
            top: 0;
            left: 0;
          }
          .content {
            padding: 40px;
            width: 75%;
            z-index: 20000;
            position: absolute;
            top: 33%;
            left: 7.5%;
          }
          .header {
            display: flex;
            flex-direction: column;
            width: 100%;
            justify-content: flex-start;
            align-items: flex-start;
          }
          .header div {
            margin-bottom: 5px;
          }
          .header-label {
            width: 100px;
            color: #707173;
            font-size: 15px;
          }
          .header-value {
            display: inline-block;
            font-size: 16px;
            margin-top: 24px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            margin-top: 20px;
          }
          th {
            color: #333;
            font-weight: normal;
            padding: 10px 0;
            border-bottom: 2px solid #F3F4F6;
            text-align: left;
          }
          td {
            padding: 10px 10px 10px 0;
            border-bottom: 1px solid #F3F4F6;
            text-align: left;
            color: #666;
          }
          .valor {
            text-align: right;
          }
          .total-row {
            background-color: #eeeeee;
            font-weight: bold;
            color: #333;
          }
          .total-row td {
            border-bottom: none;
          }
          .footer {
            text-align: right;
            font-weight: bold;
            padding-top: 10px;
          }
          .column-top {
            display: flex;
            flex-direction: column;
          }
          .line {
            display: flex;
            flex-direction: row;
            align-items: center;
            padding: 20px;
            justify-content: space-between;
            padding-left: 40px;
            width: 75%;
            position: absolute;
            top: 0;
            z-index: 20000;
            top: 20%;
            left: 7.5%;
          }
          .header img {
            align-self: center;
          }
          .total {
            padding: 10px;
            
            text-align: left;
            color: #666;
          }
          .footer {
            position: absolute; 
            bottom: 14%; 
            left: 13.4%;
            z-index: 20000;
          }
          .column-top-second {
            display: flex;
            flex-direction: column;
            position: absolute;
            right: 14%;
          }
          .description {
            width: 72% !important;
          }
          .quantity {
            width: 30% !important;
            text-align: left;
          }
          .price {
            width: 30% !important;
            text-align: center !important;
          }
          .total {
            width: 50% !important;
            text-align: right;
          }
        </style>
        </head>
        <body>
        <div class="container">
          <img src="http://vxapp.vivensis2.com.br/files/01.jpg"class="image" />
        </div>
        ${generateHTML(pages)}
        
        </body>
        </html>`,
        fileName,
        directory: 'Documents',
        base64: true,
      }

      let file = await RNHTMLtoPDF.convert(options)
      setUriPdf(file.filePath as string)

      const fileUri = FileSystem.documentDirectory + `${fileName}.pdf`
      await FileSystem.writeAsStringAsync(fileUri, file.base64 as string, {
        encoding: FileSystem.EncodingType.Base64,
      })
      sharePDF(fileUri)
      // setValue('caid', '')
      // setValue('scua', '')
      setLoading(false)
    } catch (er: any) {
      console.log(er)

      setLoading(false)
    }
  }

  return loading ? (
    <View style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}>
      <HeaderSecondary title='Orçamento' />
      <Container>
        <ActivityIndicator size='large' color={theme.COLORS.PRIMARY_400} />
      </Container>
    </View>
  ) : (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}
      contentContainerStyle={{ flex: 1 }}
    >
      <HeaderSecondary title='Orçamento' />
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-start',
          alignItems: 'center',
          marginTop: 25,
        }}
      >
        <Pdf
          source={{ uri: uriPdf }}
          onLoadComplete={(numberOfPages, filePath) => {
            console.log(`Number of pages: ${numberOfPages}`)
          }}
          onPageChanged={(page, numberOfPages) => {
            console.log(`Current page: ${page}`)
          }}
          enablePaging={false}
          onError={(error) => {
            console.log(error)
          }}
          onPressLink={(uri) => {
            console.log(`Link pressed: ${uri}`)
          }}
          style={{
            flex: 1,
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height - 80,
          }}
        />
      </View>
    </KeyboardAwareScrollView>
  )
}
