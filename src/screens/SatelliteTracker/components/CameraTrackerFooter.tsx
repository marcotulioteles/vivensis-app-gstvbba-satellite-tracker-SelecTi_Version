import { View } from "react-native"
import { Label } from "~/components/Label/variants"

interface CameraTrackerFooterProps {
    satelliteAzimuth: number,
    satelliteElevation: number,
    azimuth: number,
    elevation: number,
    viewRef: React.RefObject<View>,
    onLayout: (event: any) => void
}

export const CameraTrackerFooter: React.FC<CameraTrackerFooterProps> = ({
    azimuth,
    elevation,
    satelliteAzimuth,
    satelliteElevation,
    viewRef,
    onLayout
}) => {
  return (
    <View style={{ padding: 16, height: '11%' }} ref={viewRef} onLayout={onLayout}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Label fontSize={14} lineHeight={17} style={{ flexBasis: '48%' }}>
          Sat. Azimuth:{' '}
          <Label color='#4397B0' fontSize={14} lineHeight={17}>
            {satelliteAzimuth.toFixed(0)}°
          </Label>
        </Label>
        <View style={{ height: 32, width: 1, backgroundColor: '#D4D4D8' }} />
        <Label fontSize={14} lineHeight={17} style={{ flexBasis: '48%' }}>
          Sat. Elevação:{' '}
          <Label color='#4397B0' fontSize={14} lineHeight={17}>
            {satelliteElevation.toFixed(0)}°
          </Label>
        </Label>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Label fontSize={14} lineHeight={17} style={{ flexBasis: '48%' }}>
          Disp. Azimuth:{' '}
          <Label color='#4397B0' fontSize={14} lineHeight={17}>
            {(azimuth ?? 0).toFixed(0)}°
          </Label>
        </Label>
        <Label fontSize={14} lineHeight={17} style={{ flexBasis: '48%' }}>
          Disp. Elevação:{' '}
          <Label color='#4397B0' fontSize={14} lineHeight={17}>
            {elevation.toFixed(0)}°
          </Label>
        </Label>
      </View>
    </View>
  )
}
