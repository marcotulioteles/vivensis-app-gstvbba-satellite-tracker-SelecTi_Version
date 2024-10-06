import { useState, useEffect } from 'react';
import { Keyboard } from 'react-native';

const useKeyboardHook = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setIsOpen(true)
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setIsOpen(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return { isOpen };
};

export default useKeyboardHook;