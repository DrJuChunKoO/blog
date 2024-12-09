'use client'
import { useState } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { X } from 'lucide-react'
import { RemoveScroll } from 'react-remove-scroll'

// Utility Functions
const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity

const variants = {
  initial: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  animate: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  }),
}

const buttonVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { delay: 0.2, type: 'spring' } },
  exit: { opacity: 0, scale: 0.9, transition: { delay: 0 } },
}

function ImageView({
  image,
  onClick,
  index,
}: {
  image: { src: string; alt?: string }
  onClick: (index: number) => void
  index: number
}) {
  return (
    <div
      onClick={() => onClick(index)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick(index)
        }
      }}
      role="button"
      tabIndex={0}
      className="group relative h-full w-full cursor-zoom-in overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800"
    >
      <div className="relative h-full w-full">
        <img
          src={image.src}
          alt={image.alt || ''}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    </div>
  )
}

// ImageGrid Component
function ImageGrid({
  images,
  handleOpenGallery,
}: {
  images: { src: string; alt?: string }[]
  handleOpenGallery: (index: number) => void
}) {
  return (
    <>
      {images.length === 1 && (
        <div className="aspect-[3/2] w-full">
          <ImageView image={images[0]} onClick={(index) => handleOpenGallery(index)} index={0} />
        </div>
      )}
      {images.length === 2 && (
        <div className="grid grid-cols-2 gap-2">
          {images.map((image, i) => (
            <div key={i} className="aspect-[3/2]">
              <ImageView image={image} onClick={(index) => handleOpenGallery(index)} index={i} />
            </div>
          ))}
        </div>
      )}
      {images.length === 3 && (
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2 aspect-[3/2]">
            <ImageView image={images[0]} onClick={(index) => handleOpenGallery(index)} index={0} />
          </div>
          {images.slice(1).map((image, i) => (
            <div key={i} className="aspect-square">
              <ImageView
                image={image}
                onClick={(index) => handleOpenGallery(index)}
                index={i + 1}
              />
            </div>
          ))}
        </div>
      )}
      {images.length > 3 && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {images.map((image, i) => (
              <div key={i} className="h-48 w-auto shrink-0 md:h-56">
                <ImageView image={image} onClick={(index) => handleOpenGallery(index)} index={i} />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// Main Images Component
function Images({
  images,
  defaultIndex = 0,
  layout = 'grid',
}: {
  images: { src: string; alt?: string }[]
  defaultIndex?: number
  layout?: 'grid' | 'scroll'
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [activeIndex, setActiveIndex] = useState<number>(defaultIndex)
  const [direction, setDirection] = useState<number>(0)

  const currentImage = images[activeIndex]
  const hasMultipleImages = images.length > 1

  const handlePrevious = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setDirection(-1)
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setDirection(1)
    setActiveIndex((prev) => (prev + 1) % images.length)
  }

  const handleDragEnd = (
    e: MouseEvent | TouchEvent | PointerEvent,
    { offset, velocity }: PanInfo
  ) => {
    const swipe = swipePower(offset.x, velocity.x)

    if (swipe < -5000) {
      handleNext()
    } else if (swipe > 5000) {
      handlePrevious()
    }
  }

  const handleThumbnailClick = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1)
    setActiveIndex(index)
  }

  const handleOpenGallery = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1)
    setActiveIndex(index)
    setIsOpen(true)
  }

  if (images.length === 0) return null

  return (
    <>
      {layout === 'grid' ? (
        <ImageGrid images={images} handleOpenGallery={handleOpenGallery} />
      ) : (
        <ImageView
          image={images[defaultIndex]}
          onClick={(index) => handleOpenGallery(index)}
          index={defaultIndex}
        />
      )}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="absolute inset-0 bg-white/80 bg-noise text-black backdrop-blur dark:bg-black/50 dark:text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <RemoveScroll className="fixed inset-0 z-50 overflow-auto">
              <div className="sticky top-0 z-10 flex h-0">
                <motion.button
                  variants={buttonVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute right-5 top-5 cursor-pointer rounded-full border border-black/10 bg-white/50 p-2 backdrop-blur transition-colors hover:border-black/20 dark:border-white/20 dark:bg-black/50 dark:hover:border-white/30"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={32} strokeWidth={1} />
                </motion.button>
              </div>
              <motion.div
                onClick={() => setIsOpen(false)}
                className="relative z-0 flex h-full w-full items-center justify-center px-12 py-5 md:p-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                {hasMultipleImages && (
                  <motion.button
                    variants={buttonVariants}
                    onClick={handlePrevious}
                    className="absolute left-2 top-1/2 hidden -translate-y-1/2 cursor-pointer rounded-full border border-black/10 bg-white/50 p-2 backdrop-blur transition-colors hover:border-black/20 dark:border-white/20 dark:bg-black/50 dark:hover:border-white/30 md:left-4 md:block"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </motion.button>
                )}
                <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                  <motion.div
                    key={currentImage.src}
                    custom={direction}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={handleDragEnd}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
                    className="relative touch-pan-y"
                  >
                    <motion.div
                      className="relative flex items-center justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <motion.img
                        src={currentImage.src}
                        alt={currentImage.alt}
                        className="max-h-[80vh] max-w-[90vw] rounded-lg object-contain"
                        draggable={false}
                      />
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
                {hasMultipleImages && (
                  <motion.button
                    variants={buttonVariants}
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 hidden -translate-y-1/2 cursor-pointer rounded-full border border-black/10 bg-white/50 p-2 backdrop-blur transition-colors hover:border-black/20 dark:border-white/20 dark:bg-black/50 dark:hover:border-white/30 md:right-4 md:block"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </motion.button>
                )}
                {hasMultipleImages && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="absolute bottom-4 left-0 right-0 m-auto flex w-min gap-2 rounded-xl border border-black/10 bg-white/50 p-2 backdrop-blur dark:border-white/20 dark:bg-black/50"
                  >
                    {images.map((img, index) => (
                      <div
                        key={img.src}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleThumbnailClick(index)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation()
                            handleThumbnailClick(index)
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        className={`relative flex h-8 w-12 cursor-pointer items-center justify-center overflow-hidden rounded-md bg-black/10 dark:bg-white/10 ${
                          index === activeIndex ? 'ring-2 ring-primary-500' : ''
                        }`}
                      >
                        <img
                          src={img.src}
                          alt={img.alt || ''}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </RemoveScroll>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default function Journal({
  title,
  children,
  imgs = [],
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
          {imgs.length > 0 && <Images images={imgs} layout="grid" />}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
