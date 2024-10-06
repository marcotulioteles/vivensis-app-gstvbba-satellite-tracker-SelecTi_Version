import React from 'react'
import { Svg, Path, SvgProps, G, Defs, Rect, ClipPath } from 'react-native-svg'

type IconProps = {
  color?: string
} & SvgProps
export default function CollectiveCalculation({ color = '#233B81', ...props }: IconProps) {
  return (
    <Svg width='56' height='56' viewBox='0 0 56 56' fill='none'>
      <G clip-path='url(#clip0_679_6465)'>
        <Path
          fill-rule='evenodd'
          clip-rule='evenodd'
          d='M24.773 24.7516C24.7369 24.6991 24.6968 24.6493 24.6529 24.6028C24.4306 24.3675 24.1291 24.2353 23.8148 24.2353H19.0741C18.7597 24.2353 18.4583 24.3675 18.236 24.6028C18.0138 24.8382 17.8889 25.1574 17.8889 25.4902V26.956H13.7873C13.5418 26.956 13.3429 26.7453 13.3429 26.4854V19.3554H14.7143C15.0174 19.3554 15.3081 19.2263 15.5224 18.9964C15.7367 18.7665 15.8571 18.4546 15.8571 18.1295V13.2259C15.8571 12.9008 15.7367 12.589 15.5224 12.3591C15.3081 12.1292 15.0174 12 14.7143 12H10.1429C9.83975 12 9.54906 12.1292 9.33474 12.3591C9.12041 12.589 9 12.9008 9 13.2259V18.1295C9 18.4546 9.12041 18.7665 9.33474 18.9964C9.54906 19.2263 9.83975 19.3554 10.1429 19.3554H11.5143V40.2353C11.5143 40.7551 11.9123 41.1765 12.4032 41.1765H17.8889V42.7451C17.8889 43.0779 18.0138 43.3971 18.236 43.6325C18.4583 43.8678 18.7597 44 19.0741 44H23.8148C24.1291 44 24.4306 43.8678 24.6529 43.6325C24.8751 43.3971 25 43.0779 25 42.7451V37.7255C25 37.3927 24.8751 37.0735 24.6529 36.8381C24.4306 36.6028 24.1291 36.4706 23.8148 36.4706H19.0741C18.7597 36.4706 18.4583 36.6028 18.236 36.8381C18.0138 37.0735 17.8889 37.3927 17.8889 37.7255V39.215H13.7873C13.5418 39.215 13.3429 39.0043 13.3429 38.7444V29.388C13.3429 29.1281 13.5418 28.9174 13.7873 28.9174H17.8889V30.5098C17.8889 30.8426 18.0138 31.1618 18.236 31.3972C18.4583 31.6325 18.7597 31.7647 19.0741 31.7647H23.8148C24.1291 31.7647 24.4306 31.6325 24.6529 31.3972C24.8751 31.1618 25 30.8426 25 30.5098V25.4849C25 25.2191 24.9195 24.9621 24.773 24.7516ZM11.2222 13.9765C10.9768 13.9765 10.7778 14.1872 10.7778 14.4471V16.9882C10.7778 17.2481 10.9768 17.4588 11.2222 17.4588H13.6222C13.8677 17.4588 14.0667 17.2481 14.0667 16.9882V14.4471C14.0667 14.1872 13.8677 13.9765 13.6222 13.9765H11.2222ZM19.8444 26.8424V29.1576C19.8444 29.4175 20.0434 29.6282 20.2889 29.6282H22.5378C22.7832 29.6282 22.9822 29.4175 22.9822 29.1576V26.8424C22.9822 26.5825 22.7832 26.3718 22.5378 26.3718H20.2889C20.0434 26.3718 19.8444 26.5825 19.8444 26.8424ZM19.8444 41.3929C19.8444 41.6528 20.0434 41.8635 20.2889 41.8635H22.5378C22.7832 41.8635 22.9822 41.6528 22.9822 41.3929V39.0776C22.9822 38.8177 22.7832 38.6071 22.5378 38.6071H20.2889C20.0434 38.6071 19.8444 38.8177 19.8444 39.0776V41.3929Z'
          fill={color}
        />
        <Path
          d='M48 15.8998C48 15.6081 47.8727 15.3283 47.6461 15.122C47.4195 14.9157 47.1121 14.7998 46.7917 14.7998H20C19.4477 14.7998 19 15.2475 19 15.7998V15.9998C19 16.5521 19.4477 16.9998 20 16.9998H46.7917C47.1121 16.9998 47.4195 16.8839 47.6461 16.6776C47.8727 16.4713 48 16.1915 48 15.8998Z'
          fill={color}
        />
        <Path
          d='M46.75 26.7998H29C28.4477 26.7998 28 27.2475 28 27.7998V27.9998C28 28.5521 28.4477 28.9998 29 28.9998H46.75C47.0815 28.9998 47.3995 28.8839 47.6339 28.6776C47.8683 28.4713 48 28.1915 48 27.8998C48 27.6081 47.8683 27.3283 47.6339 27.122C47.3995 26.9157 47.0815 26.7998 46.75 26.7998Z'
          fill={color}
        />
        <Path
          d='M46.75 39.2002H29C28.4477 39.2002 28 39.6479 28 40.2002V40.4002C28 40.9525 28.4477 41.4002 29 41.4002H46.75C47.0815 41.4002 47.3995 41.2843 47.6339 41.078C47.8683 40.8717 48 40.5919 48 40.3002C48 40.0085 47.8683 39.7287 47.6339 39.5224C47.3995 39.3161 47.0815 39.2002 46.75 39.2002Z'
          fill={color}
        />
      </G>
      <Defs>
        <ClipPath id='clip0_679_6465'>
          <Rect width='56' height='56' fill='white' />
        </ClipPath>
      </Defs>
    </Svg>
  )
}
