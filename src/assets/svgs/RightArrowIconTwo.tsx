import React from 'react'
import { Svg, Path, SvgProps } from 'react-native-svg'

type IconProps = {
  color?: string
} & SvgProps
export default function RightArrowIconTwo({ color = '#06E89C', ...props }: IconProps) {
  return (
    <Svg width='11' height='59' viewBox='0 0 11 59' fill='none' {...props}>
      <Path
        d='M0 59L10.0925 53.3898L0.187695 47.4545L0 59ZM5.52167 51.7243C15.976 30.4925 9.20764 9.2749 3.83751 0.478917L2.1305 1.52108C7.26297 9.9278 13.7903 30.404 3.72738 50.8408L5.52167 51.7243Z'
        fill='#FFFDFD'
      />
    </Svg>
  )
}
