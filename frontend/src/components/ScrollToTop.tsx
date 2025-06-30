import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLenis } from "./LenisProvider";

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  const { lenis } = useLenis();

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;