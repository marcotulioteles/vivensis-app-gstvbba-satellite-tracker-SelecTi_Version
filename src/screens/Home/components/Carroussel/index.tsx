import React from 'react'
import { Dimensions, Linking, TouchableOpacity } from 'react-native'
import styled from 'styled-components/native'
import Swiper from 'react-native-swiper'
import FastImage from 'react-native-fast-image'
import { normalize } from '~/utils'

const Container = styled.View`
  width: ${Dimensions.get('window').width - normalize(48)}px;
  height: 170px;
  align-self: center;
  z-index: 1;
  margin-top: 24px;
`

const Image = styled(FastImage)`
  width: 100%;
  height: 100%;
  height: ${normalize(160)}px;
  border-radius: ${normalize(8)}px;
`

const PaginationDot = styled.View<{ active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  margin: 0 4px;
  background-color: ${({ active, theme }) => (active ? theme.COLORS.PRIMARY_400 : 'gray')};
`

interface CarouselProps {
  images: { img: string; link?: string }[]
}

const Carousel: React.FC<CarouselProps> = ({ images }) => {
  return (
    <>
      <Container>
        <Swiper
          loop={false}
          dot={<PaginationDot active={false} />}
          activeDot={<PaginationDot active={true} />}
          paginationStyle={{ bottom: -normalize(12) }}
        >
          {images.map((image, index) => (
            <TouchableOpacity
              key={String(index ?? '')}
              activeOpacity={1}
              onPress={() => {
                if (image?.link) {
                  Linking.openURL(image.link)
                }
              }}
            >
              <Image source={{ uri: image.img }} resizeMode='contain' />
            </TouchableOpacity>
          ))}
        </Swiper>
      </Container>
      {/* <PaginationContainer>
        {images.map((_, index) => (
          <PaginationDot key={index} active={index === 0} />
        ))}
      </PaginationContainer> */}
    </>
  )
}

export default Carousel
