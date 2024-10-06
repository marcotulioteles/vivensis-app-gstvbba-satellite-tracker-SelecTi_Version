import { Dimensions, Platform, PixelRatio } from 'react-native'

export const normalize = (pixelsToConvert: number) => {
  const { width: SCREEN_WIDTH } = Dimensions.get('window')
  const scale = SCREEN_WIDTH / 360

  let newSize = pixelsToConvert * scale * PixelRatio.getFontScale()

  const maxSize = pixelsToConvert * 1.2
  if (newSize > maxSize) {
    newSize = maxSize
  }

  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize))
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2
  }
}

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

export const segundosAHoraMinutos = (segundos: number) => {
  const horas = Math.floor(segundos / 3600)
  const minutos = Math.floor((segundos - horas * 3600) / 60)

  return `${horas}h${minutos < 10 ? '0' : ''}${minutos}min`
}

export const cpfMask = (cpf: string): string =>
  cpf
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')

export const telefoneFixoMask = (telefone: string): string =>
  telefone
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4})(\d)/, '$1-$2')

export const celularMask = (celular: string): string =>
  celular
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{1})(\d{4})(\d)/, '$1$2-$3')

export const cepMask = (cep: string): string => cep.replace(/(\d{5})(\d)/, '$1-$2')

export const bytosToMb = (bytes: number): string => (bytes / 1048576).toFixed(2)

export const dataBRMask = (data: string): string =>
  data
    .replace(/\D/g, '') // Remove todos os caracteres não numéricos
    .replace(/(\d{2})(\d)/, '$1/$2') // Insere a barra após o dia
    .replace(/(\/\d{2})(\d)/, '$1/$2') // Insere a barra após o mês corretamente
    .replace(/(\d{2}\/\d{2}\/\d{4}).*/, '$1') // Garante que não haja mais de 4 dígitos no ano e remove qualquer caractere extra

export const removerCaracteresEspeciais = (texto: string) => {
  var regex = /[^\w\s]/gi

  var novoTexto = texto.replace(regex, '')

  return novoTexto
}

export function extractCod(name: string) {
  const codPattern = /COD: (\d+)/
  const match = name.match(codPattern)
  return match ? match[1] : null
}
