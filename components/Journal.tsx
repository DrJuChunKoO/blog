'use client'
import { useState } from 'react'
import { motion, AnimatePresence, useMotionValue } from 'framer-motion'
import { twMerge } from 'tailwind-merge'
import { X } from 'lucide-react'
import { RemoveScroll } from 'react-remove-scroll'
function Image({
  src,
  alt,
  className = '',
  imageClassName = '',
}: {
  src: string
  alt?: string
  className?: string
  imageClassName?: string
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const zIndex = useMotionValue(0)
  const variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  }
  const button = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { delay: 0.5, type: 'spring' } },
    exit: { opacity: 0, scale: 0.9, transition: { delay: 0 } },
  }
  return (
    <>
      <motion.div
        className={twMerge(
          'group relative w-full cursor-pointer rounded-lg object-cover',
          className
        )}
        style={{ zIndex }}
        onClick={() => setIsOpen(true)}
        onLayoutAnimationStart={() => {
          zIndex.set(20)
        }}
        onLayoutAnimationComplete={() => {
          if (!isOpen) {
            zIndex.set(0)
          }
        }}
        layoutId={`image-${src}`}
      >
        <motion.img
          src={src}
          alt={alt}
          className={twMerge('rounded-lg object-cover object-center', imageClassName)}
        />
        <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed inset-0 z-50"
            >
              <motion.div
                variants={variants}
                className="absolute inset-0 bg-white/80 bg-noise text-black backdrop-blur dark:bg-black/50 dark:text-white"
              />
              <RemoveScroll className="fixed inset-0 z-50 overflow-auto">
                <div className="sticky top-0 z-10 flex h-0">
                  <motion.button
                    variants={button}
                    className="absolute right-5 top-5 cursor-pointer rounded-full border border-black/10 bg-white/50 p-2 backdrop-blur transition-colors hover:border-black/20 dark:border-white/20 dark:bg-black/50 dark:hover:border-white/30"
                    onClick={() => setIsOpen(false)}
                  >
                    <X size={32} strokeWidth={1} />
                  </motion.button>
                </div>
                <motion.div
                  onClick={() => setIsOpen(false)}
                  className="relative z-0 flex h-full w-full items-center justify-center p-5 md:p-10"
                >
                  <motion.img
                    src={src}
                    alt={alt}
                    className="max-h-full max-w-full rounded-lg"
                    onClick={() => setIsOpen(true)}
                    layoutId={`image-${src}`}
                  />
                </motion.div>
              </RemoveScroll>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default function Journal({
  title,
  children,
  imgs,
}: {
  title: string
  children: React.ReactNode
  imgs: {
    src: string
    alt?: string
  }[]
}) {
  return (
    <motion.div className="not-prose my-8 flex gap-4">
      <motion.div
        className="w-1 shrink-0 origin-top bg-primary-100 dark:bg-primary-900"
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        exit={{ scaleY: 0 }}
        transition={{
          duration: 0.5,
        }}
        viewport={{ once: true }}
      />
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{
          duration: 0.5,
        }}
        viewport={{ once: true }}
      >
        <div className="text-2xl font-bold text-primary-500">{title}</div>
        <div className="mb-2 text-gray-700 dark:text-gray-300">{children}</div>{' '}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.25,
          }}
          viewport={{ once: true }}
        >
          {imgs.length === 1 && (
            <Image src={imgs[0].src} alt={imgs[0].alt} imageClassName="w-full" />
          )}
          {imgs.length === 2 && (
            <div className="grid grid-cols-2 gap-2">
              <Image src={imgs[0].src} alt={imgs[0].alt} imageClassName="w-full aspect-[3/2]" />
              <Image src={imgs[1].src} alt={imgs[1].alt} imageClassName="w-full aspect-[3/2]" />
            </div>
          )}
          {imgs.length === 3 && (
            <div className="grid grid-cols-2 gap-2">
              <Image
                src={imgs[0].src}
                alt={imgs[0].alt}
                className="col-span-2"
                imageClassName="w-full"
              />
              <Image src={imgs[1].src} alt={imgs[1].alt} imageClassName="w-full aspect-square" />
              <Image src={imgs[2].src} alt={imgs[2].alt} imageClassName="w-full aspect-square" />
            </div>
          )}
          {imgs.length >= 4 && (
            <div className="w-full overflow-x-auto rounded-lg">
              <div className="flex gap-4">
                {imgs.map(({ src, alt }, i) => (
                  <Image
                    key={i}
                    src={src}
                    alt={alt}
                    className="h-48 w-auto shrink-0 md:h-56"
                    imageClassName="h-full"
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
