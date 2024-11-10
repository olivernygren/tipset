import { useEffect, useState } from 'react';

export enum DeviceSizes {
  MOBILE_DEVICE = 420,
  MOBILE = 768,
  TABLET = 1024,
}

const useResizeListener = (breakpoint: DeviceSizes): boolean => {
  const [isTablet, setIsTablet] = useState<boolean>(false);

  useEffect(() => {
    const updateSizes = () => {
      if (window) {
        setIsTablet(window.innerWidth < breakpoint);
      }
    };
    updateSizes();
    window.addEventListener('resize', updateSizes);

    return () => {
      window.removeEventListener('resize', updateSizes);
    };
  }, [breakpoint]);

  return isTablet;
};

export default useResizeListener;
