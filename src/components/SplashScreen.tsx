import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const seen = sessionStorage.getItem('splash-seen');
    if (seen) { setShow(false); return; }
    const timer = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem('splash-seen', 'true');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-secondary"
          initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.5 } }}>
          <motion.div className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}>
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-5xl font-black text-primary">RCB</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-white mb-2">Racing Club de Bingerville</h1>
            <p className="text-white/60 text-sm">Le ciel et le marine, une histoire de passion</p>
          </motion.div>
          <div className="mt-12 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.8, ease: 'easeInOut' }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
