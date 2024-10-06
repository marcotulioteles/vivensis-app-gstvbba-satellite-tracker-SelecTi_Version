import React from 'react'
import { Svg, Path, SvgProps } from 'react-native-svg'

type IconProps = {
  color?: string
} & SvgProps
export default function RightArrowIcon({ color = '#06E89C', ...props }: IconProps) {
  return (
    <Svg width='11' height='59' viewBox='0 0 11 59' fill='none' {...props}>
      <Path
        d='M0 -3.8147e-06L10.0925 5.61019L0.187695 11.5455L0 -3.8147e-06ZM5.52167 7.27568C15.976 28.5075 9.20764 49.7251 3.83751 58.5211L2.1305 57.4789C7.26297 49.0722 13.7903 28.596 3.72738 8.15916L5.52167 7.27568Z'
        fill='#FFFDFD'
      />
    </Svg>
  )
}
