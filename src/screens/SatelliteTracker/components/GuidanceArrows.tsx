import { View, StyleSheet } from "react-native";
import { ARROW_SIZE, AZIMUTH_THRESHOLD, ELEVATION_THRESHOLD } from '../constants/satellite-tracker.const';
import { ArrowRightIcon } from "~/assets/svgs";

interface GuidanceArrowsProps {
    isSatelliteVisible: boolean,
    azimuthDiff: number,
    elevationDiff: number,
    screenWidth: number,
    screenHeight: number
}

export const GuidanceArrows: React.FC<GuidanceArrowsProps> = ({ 
    isSatelliteVisible,
    azimuthDiff,
    elevationDiff,
    screenHeight,
    screenWidth
}) => {
    return (
        <View style={styles.arrowContainer}>
            <ArrowRightIcon 
              style={[styles.arrow, {
                right: 20,
                top: (screenHeight - ARROW_SIZE) / 2,
                opacity: !isSatelliteVisible && azimuthDiff > AZIMUTH_THRESHOLD ? 1 : 0
              }]}
            /> 
            <ArrowRightIcon 
              style={[styles.arrow, {
                left: 20,
                top: (screenHeight - ARROW_SIZE) / 2,
                transform: [{ rotate: '180deg' }],
                opacity: !isSatelliteVisible && azimuthDiff < -AZIMUTH_THRESHOLD ? 1 : 0
              }]}
            /> 
            <ArrowRightIcon 
              style={[styles.arrow, {
                top: 100,
                transform: [{ rotate: '270deg' }],
                opacity: !isSatelliteVisible && elevationDiff < -ELEVATION_THRESHOLD ? 1 : 0
              }]}
            /> 
            <ArrowRightIcon
                style={[styles.arrow, {
                    bottom: 100,
                    transform: [{ rotate: '90deg' }],
                    opacity: !isSatelliteVisible && elevationDiff > ELEVATION_THRESHOLD ? 1 : 0
                  }]}
              />
          </View>
    )
}

const styles = StyleSheet.create({
    arrowContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    position: 'absolute',
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    resizeMode: 'contain',
  }
})