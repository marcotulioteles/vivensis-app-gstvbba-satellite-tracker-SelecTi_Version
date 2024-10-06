import { Audio } from 'expo-av';

export const playBeepSound = async (beepSoundRef: React.MutableRefObject<Audio.Sound | null>) => {
    try {
      if (beepSoundRef.current) {
        await beepSoundRef.current.setPositionAsync(0)
        await beepSoundRef.current.playAsync()
      } else {
        const { sound } = await Audio.Sound.createAsync(require('./file/arquivo.mp3'))
        beepSoundRef.current = sound
        await sound.playAsync()
      }
    } catch (er) {
      console.log(er)
    }
  }
  
  export const playSuccessSound = async (successSoundRef: React.MutableRefObject<Audio.Sound | null>) => {
    try {
      if (successSoundRef.current) {
        await successSoundRef.current.playAsync()
      } else {
        const { sound } = await Audio.Sound.createAsync(require('./file/arquivo.mp3'))
        successSoundRef.current = sound
        await sound.setIsLoopingAsync(true)
        await sound.playAsync()
      }
    } catch (er) {
      console.log(er)
    }
  }
  
  export const stopSuccessSound = async (successSoundRef: React.MutableRefObject<Audio.Sound | null>) => {
    try {
      if (successSoundRef.current) {
        await successSoundRef.current.pauseAsync()
      }
    } catch (er) {
      console.log(er)
    }
  }