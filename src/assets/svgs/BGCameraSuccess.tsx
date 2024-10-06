import React from 'react'
import { Svg, Path, SvgProps, G, Defs, ClipPath, Rect } from 'react-native-svg'

type IconProps = {
  color?: string
  showSuccess?: boolean
} & SvgProps
export default function BGCameraSuccess({
  color = '#06E89C',
  showSuccess = true,
  ...props
}: IconProps) {
  return (
    <Svg width='400' height='672' viewBox='0 0 400 672' fill='none' {...props}>
      <Path
        fill-rule='evenodd'
        clip-rule='evenodd'
        d='M200.5 265.002V239H199.5V265.002C160.684 265.269 129.269 296.684 129.002 335.5H103V336.5H129.002C129.269 375.316 160.684 406.731 199.5 406.998V433H200.5V406.998C239.316 406.731 270.731 375.316 270.998 336.5H297V335.5H270.998C270.731 296.684 239.316 265.269 200.5 265.002ZM199.5 266.002V295H200.5V266.002C238.763 266.269 269.731 297.237 269.998 335.5H241V336.5H269.998C269.731 374.763 238.763 405.731 200.5 405.998V377H199.5V405.998C161.237 405.731 130.269 374.763 130.002 336.5H159V335.5H130.002C130.269 297.237 161.237 266.269 199.5 266.002Z'
        fill={color}
        stroke={color}
        strokeWidth='3'
      />
      {showSuccess && (
        <G clip-path='url(#clip0_910_3541)'>
          <Path
            d='M200 361C213.807 361 225 349.807 225 336C225 322.193 213.807 311 200 311C186.193 311 175 322.193 175 336C175 349.807 186.193 361 200 361Z'
            fill={color}
          />
          <Path
            d='M213 326L197 344L187 336'
            stroke='white'
            stroke-width='2'
            stroke-miterlimit='10'
            stroke-linecap='round'
            stroke-linejoin='round'
          />
        </G>
      )}
      <Defs>
        <ClipPath id='clip0_910_3541'>
          <Rect width='50' height='50' fill='white' transform='translate(175 311)' />
        </ClipPath>
      </Defs>
    </Svg>
  )
}
