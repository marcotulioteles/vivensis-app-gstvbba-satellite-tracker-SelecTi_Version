import React, { useCallback, useEffect, useState } from 'react'
import { View, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native'
import { useTheme } from 'styled-components'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import NetInfo from '@react-native-community/netinfo'
import { Container, TextEmpty } from './styles'
import { Button } from '~/components/Button'
import { Label } from '~/components/Label/variants'
import { Input } from '~/components/Input'
import { HeaderSecondary } from '~/components/HeaderSecondary'
import { ListComponent } from './components/ListComponent'
import api from '~/services/api'
import { TOKEN } from '@env'
import { Line } from '~/components/Containers/styles'
import ModalInfo from '~/components/ModalInfo'
import { normalize } from '~/utils'
import { AxiosRequestConfig } from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { RootBottomTabParamList } from '~/routes'
import CurrencyInput from 'react-native-currency-input'

interface Item {
  id: number
  uuid?: string
  descricao: string
  url: string
  tipo: string
  conexoes: number
  db: number
  qualidade: number
  forca: number
  parentId?: string
  size?: string
  children?: Item[]
}

interface Tree {
  antenna: Item
  client?: string
  children: Item[]
  id?: string
}

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

type NewCollectiveCalculationProp = RouteProp<RootBottomTabParamList, 'NewCollectiveCalculation'>

export const NewCollectiveCalculation: React.FC = () => {
  const theme = useTheme()
  const navigation = useNavigation()
  const route = useRoute<NewCollectiveCalculationProp>()
  const [itens, setItens] = useState<Item[]>([])
  const [antennas, setAntennas] = useState<Item[]>([])
  const [divisorsAndReceptors, setDivisorsAndReceptors] = useState<Item[]>([])

  const [tree, setTree] = useState<Tree | null>(null)
  const [selectedId, setSelectedId] = useState<number | undefined>()
  const [parentUUID, setParentUUID] = useState<string | undefined>()
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [size, setSize] = useState<string>('')
  const [client, setClient] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [hasConnection, setHasConnection] = useState<boolean>(false)
  const [modalType, setModalType] = useState<'antena' | 'others'>('antena')

  const [modalDelete, setModalDelete] = useState<boolean>(false)
  const [nodeToDelete, setNodeToDelete] = useState<Item | null>(null)
  const [nodeToEdit, setNodeToEdit] = useState<Item | null>(null)

  const [modalError, setModalError] = useState(false)
  const [handleDeleteCalculationModal, setHandleDeleteCalculationModal] = useState(false)
  const [errorTitle, setErrorTitle] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const [modalSuccess, setModalSuccess] = useState(false)
  const [successTitle, setSuccessTitle] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [originalTree, setOriginalTree] = useState<Tree | null>(null)
  const [modalUnsavedChanges, setModalUnsavedChanges] = useState(false)

  const config: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  }

  useFocusEffect(
    useCallback(() => {
      async function getNetInfo() {
        NetInfo.fetch().then((state) => {
          setHasConnection(state.isConnected || false)
        })
      }
      getNetInfo()
    }, [])
  )

  const handleSelectItem = (item: Item) => {
    setTree((prevTree) => {
      if (!prevTree) {
        return {
          antenna: { ...item, uuid: generateUUID() },
          children: [],
        }
      } else {
        const newTree = { ...prevTree }

        const addItemToTree = (parent: Item, item: Item) => {
          if (parent.uuid === item.parentId) {
            if (!parent.children) parent.children = []
            if (
              (parent.descricao.includes('Antena') && parent.children.length < 1) ||
              (parent.descricao.includes('Divisor') && parent.children.length < parent.conexoes) ||
              (parent.descricao.includes('Amplificador') &&
                parent.children.length < parent.conexoes)
            ) {
              parent.children.push(item)
            }
          } else if (parent.children) {
            parent.children.forEach((child) => addItemToTree(child, item))
          }
        }

        addItemToTree(newTree.antenna, item)
        return newTree
      }
    })
  }

  const handleEditItem = (newItem: Item) => {
    setTree((prevTree) => {
      if (!prevTree) return null

      const newTree = { ...prevTree }

      const editItemInTree = (parent: Item, newItem: Item) => {
        if (parent.uuid === newItem.uuid) {
          if (newItem.descricao.includes('Antena')) {
            parent.descricao = newItem.descricao
            parent.url = newItem.url
            parent.tipo = newItem.tipo
            parent.conexoes = newItem.conexoes
            parent.db = newItem.db
            parent.qualidade = newItem.qualidade
            parent.forca = newItem.forca
          } else if (newItem.descricao.includes('Divisor')) {
            parent.children = parent.children || []
            parent.descricao = newItem.descricao
            parent.url = newItem.url
            parent.tipo = newItem.tipo
            parent.conexoes = newItem.conexoes
            parent.db = newItem.db
            parent.qualidade = newItem.qualidade
            parent.forca = newItem.forca
            parent.size = newItem.size
          } else {
            parent.descricao = newItem.descricao
            parent.url = newItem.url
            parent.tipo = newItem.tipo
            parent.conexoes = newItem.conexoes
            parent.db = newItem.db
            parent.qualidade = newItem.qualidade
            parent.forca = newItem.forca
            parent.children = []
            parent.size = newItem.size
          }
        } else if (parent.children) {
          parent.children = parent.children.map((child) => {
            editItemInTree(child, newItem)
            return child
          })
        }
      }

      editItemInTree(newTree.antenna, newItem)
      return newTree
    })

    setNodeToEdit(null)
  }

  const handleDeleteNode = () => {
    if (!nodeToDelete) return

    const deleteNode = (parent: Item, nodeId: string) => {
      if (parent.children) {
        parent.children = parent.children.filter((child) => child.uuid !== nodeId)
        parent.children.forEach((child) => deleteNode(child, nodeId))
      }
    }

    setTree((prevTree) => {
      if (!prevTree) return null

      const newTree = { ...prevTree }

      if (newTree.antenna.uuid === nodeToDelete.uuid) {
        return null
      }

      deleteNode(newTree.antenna, nodeToDelete.uuid!)
      return newTree
    })

    setNodeToDelete(null)
    setModalDelete(false)
  }

  const handleOkPress = () => {
    if (!selectedId || (!parentUUID && !nodeToEdit)) {
      alert('Por favor selecione um item.')
      return
    }
    if (Number(size) <= 0) {
      alert('O tamanho do cabo deve ser maior que zero.')
      return
    }
    if (modalType === 'others' && !size) {
      alert('Por favor digite o tamanho do cabo.')
      return
    }

    const selectedItem = divisorsAndReceptors.find((item) => item.id === selectedId)
    if (selectedItem) {
      if (nodeToEdit) {
        handleEditItem({
          ...selectedItem,
          uuid: nodeToEdit.uuid,
          parentId: nodeToEdit.parentId,
          size,
        })
      } else {
        handleSelectItem({ ...selectedItem, parentId: parentUUID, uuid: generateUUID(), size })
      }
      setSelectedId(undefined)
      setParentUUID(undefined)
      setSize('')
      setModalVisible(false)
    }
  }

  useEffect(() => {
    async function getItens() {
      if (hasConnection) {
        setLoading(true)
        const { data } = await api.get('vxappitenscol', config)

        setItens(data.itens)

        setAntennas(data.itens.filter((it: Item) => it.descricao.includes('Antena')))
        setDivisorsAndReceptors(
          data.itens.filter(
            (it: Item) => !it.descricao.includes('Antena') && !it.descricao.includes('Cabo Coaxial')
          )
        )
        setLoading(false)
      }
    }
    getItens()
  }, [hasConnection])

  const saveCalculation = async () => {
    if (!tree) {
      setModalError(true)
      setErrorMessage('Nenhuma árvore de sinal para salvar.')
      setErrorTitle('Houve um erro!')
      return
    }
    if (!client || client.length < 3) {
      setModalError(true)
      setErrorMessage('Digite um nome de cliente com pelo menos 3 caracteres e tente novamente.')
      setErrorTitle('Houve um erro!')
      return
    }
    try {
      const existingCalculations = await AsyncStorage.getItem('calculations@')
      const calculations = existingCalculations ? JSON.parse(existingCalculations) : []

      if (route.params?.id) {
        const calculationIndex = calculations.findIndex(
          (calc: any) => calc.id === route?.params?.id
        )
        if (calculationIndex !== -1) {
          calculations[calculationIndex] = {
            ...tree,
            date: new Date(),
            id: route.params.id,
            client,
          }
        } else {
          calculations.push({ ...tree, date: new Date(), id: new Date().getTime(), client })
        }
      } else {
        calculations.push({ ...tree, date: new Date(), id: new Date().getTime(), client })
      }

      await AsyncStorage.setItem('calculations@', JSON.stringify(calculations))
      setModalSuccess(true)
      setSuccessMessage('Seu cálculo foi salvo com sucesso.')
      setSuccessTitle('Sucesso!')
    } catch (error) {
      console.error('Erro ao salvar cálculo', error)
      setModalError(true)
      setErrorMessage('Nenhuma árvore de sinal para salvar.')
      setErrorTitle('Houve um erro!')
    }
  }

  const handleDeleteCalculation = async () => {
    const existingCalculations = await AsyncStorage.getItem('calculations@')
    const calculations = existingCalculations ? JSON.parse(existingCalculations) : []

    const updatedCalculations = calculations.filter((item: any) => item.id !== route?.params?.id)

    await AsyncStorage.setItem('calculations@', JSON.stringify(updatedCalculations))

    navigation.goBack()
  }

  const renderTree = (node: Item, level: number = 0): JSX.Element | null => {
    if (!node) return null

    let isAdd = false

    if (node.descricao.includes('Antena') || node.descricao.includes('Amplificador')) {
      isAdd = !node.children || node.children.length === 0
    } else if (node.descricao.includes('Divisor')) {
      isAdd = !node.children || node.children.length < node.conexoes
    } else if (node.descricao.includes('Receptor')) {
      isAdd = false
    }

    return (
      <View
        key={`${node.uuid}-${level}-${node.descricao}`}
        style={{ paddingLeft: level * normalize(6) }}
      >
        <ListComponent
          title={node.descricao}
          isAntenna={node.descricao.includes('Antena')}
          isAdd={isAdd}
          isEdit
          isDelete
          url={node.url}
          size={node?.size ? `${node?.size}` : undefined}
          tree={tree ? [tree.antenna, ...tree.children] : []}
          uuid={node.uuid!}
          handleDelete={() => {
            setNodeToDelete(node)
            setModalDelete(true)
          }}
          handleAdd={() => {
            setModalType('others')
            setParentUUID(node.uuid)
            setModalVisible(true)
          }}
          handleEdit={() => {
            setNodeToEdit(node)
            setModalType(node.descricao.includes('Antena') ? 'antena' : 'others')
            setModalVisible(true)
          }}
        />
        {node.children && node.children.map((child) => renderTree(child, level + 1))}
      </View>
    )
  }

  useFocusEffect(
    useCallback(() => {
      async function loadCalculations() {
        try {
          if (route.params?.id) {
            const storedCalculations = await AsyncStorage.getItem('calculations@')
            if (storedCalculations) {
              const parsedCalculations: Tree[] = JSON.parse(storedCalculations)
              const currentCalculation = parsedCalculations.find(
                (it) => it.id === route?.params?.id
              )
              if (currentCalculation) {
                setClient(currentCalculation?.client ?? '')
                setTree(JSON.parse(JSON.stringify(currentCalculation)))
                setOriginalTree(JSON.parse(JSON.stringify(currentCalculation)))
              }
            }
          }
        } catch (error) {
          console.error('Erro ao carregar cálculos', error)
        }
      }
      loadCalculations()
    }, [route.params?.id])
  )

  const deepEqual = (str1: string, str2: string): boolean => {
    return str1 === str2
  }

  const handleLeftAction = () => {
    const treeStringified = JSON.stringify(tree)
    const originalTreeStringified = JSON.stringify(originalTree)
    if (
      (route?.params?.id &&
        tree &&
        originalTree &&
        !deepEqual(treeStringified, originalTreeStringified)) ||
      (!route?.params?.id && tree)
    ) {
      setModalUnsavedChanges(true)
    } else {
      navigation.goBack()
    }
  }

  return loading ? (
    <View style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}>
      <HeaderSecondary title={route?.params?.id ? 'Coletiva: Detalhes' : 'Novo Cálculo'} />
      <Container>
        <ActivityIndicator size='large' color={theme.COLORS.PRIMARY_400} />
      </Container>
    </View>
  ) : (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}
      contentContainerStyle={{ flex: 1 }}
    >
      <HeaderSecondary
        title={route?.params?.id ? 'Coletiva: Detalhes' : 'Novo Cálculo'}
        isDelete={!!route?.params?.id}
        action={() => {
          if (route?.params?.id) setHandleDeleteCalculationModal(true)
        }}
        hasAnotherAction
        handleLeftAction={handleLeftAction}
      />
      <Container>
        <Line marginTop={4}>
          <Label fontSize={14} textAlign='left' color={theme.COLORS.PRIMARY_500}>
            Cliente
          </Label>
        </Line>

        <Input
          placeholder={'Informe o nome do cliente'}
          accessibilityLabel={'Informe o nome do cliente'}
          defaultValue=''
          value={client}
          hasValidation
          autoCorrect={false}
          onBlur={() => {}}
          onChangeText={(e) => {
            setClient(e)
          }}
        />

        {tree ? (
          <>
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              {renderTree(tree.antenna)}
            </ScrollView>
          </>
        ) : (
          <TextEmpty>
            Para iniciar o cálculo da coletiva, adicione uma antena à árvore de sinal.
          </TextEmpty>
        )}

        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            padding: 12,
            marginTop: 'auto',
            marginBottom: 24,
          }}
        >
          {tree ? (
            <>
              <Button
                text={'Salvar Cálculo'}
                disabled={!hasConnection}
                onPress={() => {
                  saveCalculation()
                }}
                color={theme.COLORS.SECONDARY_400}
              />

              {/* {route?.params?.id && (
                <Button
                  text={'Deletar cálculo'}
                  disabled={!hasConnection}
                  onPress={() => {
                    setHandleDeleteCalculationModal(true)
                  }}
                  textColor={theme.COLORS.SECONDARY_400}
                  color={'transparent'}
                />
              )} */}
            </>
          ) : (
            <Button
              text={'Adicionar antena'}
              disabled={!hasConnection}
              onPress={() => {
                setModalType('antena')
                setModalVisible(true)
              }}
              color={theme.COLORS.SECONDARY_400}
            />
          )}
        </View>
      </Container>

      {modalVisible && (
        <Modal
          animationType='fade'
          transparent
          visible={modalVisible}
          onRequestClose={() => setModalVisible(!modalVisible)}
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
              onPress={() => {
                setModalVisible(!modalVisible)
                setSelectedId(undefined)
                setParentUUID(undefined)
                setSize('')
              }}
            ></TouchableOpacity>
            <View
              style={{
                flexBasis: '70%',
                width: '100%',
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                height: loading ? 200 : 480,
                borderRadius: 16,
                flex: 1,
              }}
            >
              <Container>
                <Label
                  isMedium
                  lineHeight={21}
                  fontSize={16}
                  textAlign={'left'}
                  style={{ marginBottom: 16 }}
                >
                  {modalType === 'others' ? 'Selecione um dispositivo' : 'Selecione uma antena'}
                </Label>
                {modalType === 'others' && (
                  <View
                    style={{
                      marginBottom: 8,
                      borderColor: theme.COLORS.GRAY_10,
                      borderWidth: 1,
                      padding: 8,
                      borderRadius: 8,
                      backgroundColor: 'transparent',
                    }}
                  >
                    <CurrencyInput
                      placeholder='Selecione o tamanho do cabo'
                      onChangeValue={(e) => setSize(e ? `${e}` : '0')}
                      keyboardType='numeric'
                      value={Number(size)}
                      delimiter=''
                      separator=','
                      precision={2}
                    />
                  </View>
                )}
                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={{ flex: 1, minHeight: 490, flexGrow: 0 }}
                  showsVerticalScrollIndicator={false}
                >
                  {modalType === 'others'
                    ? divisorsAndReceptors.map((it: Item) => (
                        <TouchableOpacity
                          key={it.id}
                          style={{
                            marginBottom: 8,
                            borderColor:
                              selectedId === it.id
                                ? theme.COLORS.GRAY_10
                                : theme.COLORS.PRIMARY_400,
                            borderWidth: 1,
                            padding: 8,
                            borderRadius: 8,
                            backgroundColor:
                              selectedId === it.id ? theme.COLORS.GRAY_10 : 'transparent',
                          }}
                          onPress={() => {
                            setSelectedId(it.id === selectedId ? undefined : it.id)
                          }}
                        >
                          <Label
                            textAlign='left'
                            color={selectedId === it.id ? 'white' : theme.COLORS.PRIMARY_400}
                            fontSize={15}
                          >
                            {it.descricao.split('+')[0]}
                          </Label>
                        </TouchableOpacity>
                      ))
                    : antennas.map((it: Item) => (
                        <TouchableOpacity
                          key={it.id}
                          style={{
                            marginBottom: 8,
                            borderColor: theme.COLORS.PRIMARY_400,
                            borderWidth: 1,
                            paddingVertical: 8,
                            borderRadius: 8,
                          }}
                          onPress={() => {
                            if (nodeToEdit) {
                              handleEditItem({ ...it, uuid: nodeToEdit.uuid })
                            } else {
                              handleSelectItem({ ...it, uuid: generateUUID() })
                            }
                            setModalVisible(!modalVisible)
                          }}
                        >
                          <Label color={theme.COLORS.PRIMARY_400} fontSize={15}>
                            {it.descricao}
                          </Label>
                        </TouchableOpacity>
                      ))}
                  <View style={{ marginBottom: 40 }}>
                    <Button text={'Ok'} onPress={handleOkPress} />
                  </View>
                </ScrollView>
              </Container>
            </View>
          </View>
        </Modal>
      )}
      <ModalInfo
        transparent
        loading={false}
        modalIsVisible={modalDelete}
        onChangeVisible={handleDeleteNode}
        closeButton={() => setModalDelete(false)}
        message='Essa ação é irreversível, você tem certeza?'
        buttonText='Sim, Quero Deletar'
        secondButtonText='Não, Cancelar'
        title='Deletar produto'
        actionSecond={() => setModalDelete(false)}
        icon={'alert'}
      />
      <ModalInfo
        transparent
        loading={false}
        modalIsVisible={handleDeleteCalculationModal}
        onChangeVisible={handleDeleteCalculation}
        closeButton={() => setHandleDeleteCalculationModal(false)}
        message='Essa ação é irreversível, você tem certeza?'
        buttonText='Sim, Quero Deletar'
        secondButtonText='Não, Cancelar'
        title='Deletar cálculo'
        actionSecond={() => setHandleDeleteCalculationModal(false)}
        icon={'alert'}
      />
      <ModalInfo
        transparent
        loading={false}
        modalIsVisible={modalError}
        onChangeVisible={() => setModalError(false)}
        closeButton={() => setModalError(false)}
        message={errorMessage}
        buttonText='Tentar novamente'
        title={errorTitle}
        icon={'alert'}
      />
      <ModalInfo
        transparent
        loading={false}
        modalIsVisible={modalSuccess}
        onChangeVisible={() => {
          setModalSuccess(false)
          navigation.goBack()
        }}
        closeButton={() => setModalSuccess(false)}
        message={successMessage}
        buttonText='Ok, voltar'
        title={successTitle}
        icon={'success'}
      />
      <ModalInfo
        transparent
        loading={false}
        modalIsVisible={modalUnsavedChanges}
        onChangeVisible={() => {
          setModalUnsavedChanges(false)
          navigation.goBack()
        }}
        closeButton={() => setModalUnsavedChanges(false)}
        message='Você tem alterações não salvas. Deseja sair sem salvar?'
        buttonText='Sim, Sair'
        secondButtonText='Não, Cancelar'
        title='Alterações não salvas'
        actionSecond={() => setModalUnsavedChanges(false)}
        icon={'alert'}
      />
    </KeyboardAwareScrollView>
  )
}
