import React from 'react'
import { Svg, Path, SvgProps } from 'react-native-svg'

type IconProps = {
  color?: string
} & SvgProps
export default function ArrowChildren({ color = '#D4D4D8', ...props }: IconProps) {
  return (
    <Svg width='14' height='44' viewBox='0 0 14 44' fill='none' {...props}>
      <Path
        fill-rule='evenodd'
        clip-rule='evenodd'
        d='M0.771428 0C1.19748 0 1.54286 0.341428 1.54286 0.762601V34.317C1.54286 36.1421 3.03951 37.6216 4.88571 37.6216H11.3662L7.77375 34.0703C7.47249 33.7725 7.47249 33.2896 7.77375 32.9918C8.07501 32.694 8.56345 32.694 8.86471 32.9918L13.7741 37.845C14.0753 38.1428 14.0753 38.6257 13.7741 38.9235L8.86471 43.7766C8.56345 44.0745 8.07501 44.0745 7.77375 43.7766C7.47249 43.4788 7.47249 42.996 7.77375 42.6982L11.3662 39.1468H4.88571C2.18741 39.1468 0 36.9845 0 34.317V0.762601C0 0.341428 0.34538 0 0.771428 0Z'
        fill={color}
      />
    </Svg>
  )
}
