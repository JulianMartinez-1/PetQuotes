'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dog, Cat, Bird } from 'lucide-react';
import { DURATIONS } from '@/constants/animations';

/**
 * Mascota trotando en línea horizontal
 * Simula el movimiento natural de un perro/gato caminando
 */
export const PetTrotting = ({ 
  type = 'dog' as 'dog' | 'cat' | 'bird',
  speed = 4000,
  delay = 0,
  className = ''
}: {
  type?: 'dog' | 'cat' | 'bird';
  speed?: number;
  delay?: number;
  className?: string;
}) => {
  const getIcon = () => {
    switch (type) {
      case 'cat':
        return <Cat className="w-12 h-12 text-primary-600" />;
      case 'bird':
        return <Bird className="w-10 h-10 text-green-500" />;
      default:
        return <Dog className="w-12 h-12 text-primary-500" />;
    }
  };

  const trotVariants = {
    animate: {
      x: ['-10%', '110%'],
      transition: {
        duration: speed / 1000,
        repeat: Infinity,
        repeatDelay: 1,
        ease: 'linear'
      }
    }
  };

  const legVariants = {
    animate: {
      rotate: [0, -15, 0, 15, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <motion.div
      className={`flex items-center gap-1 ${className}`}
      variants={trotVariants}
      animate="animate"
      style={{ originX: 0 }}
    >
      <motion.div
        variants={legVariants}
        animate="animate"
        style={{ transformOrigin: 'center bottom' }}
      >
        {getIcon()}
      </motion.div>
    </motion.div>
  );
};

/**
 * Contenedor de mascotas saltando/jugando
 */
export const PlayfulPets = ({ 
  count = 3,
  className = ''
}: {
  count?: number;
  className?: string;
}) => {
  const petTypes = ['dog', 'cat', 'bird'] as const;

  const bounceVariants = {
    animate: (i: number) => ({
      y: [0, -20, 0],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 1.5,
        delay: i * 0.2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    })
  };

  return (
    <div className={`flex justify-center items-end gap-8 ${className}`}>
      {Array.from({ length: Math.min(count, 3) }).map((_, i) => {
        const petType = petTypes[i % 3];
        return (
          <motion.div
            key={i}
            custom={i}
            variants={bounceVariants}
            animate="animate"
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.2,
                repeat: Infinity,
              }}
            >
              {petType === 'dog' && <Dog className="w-16 h-16 text-primary-500" />}
              {petType === 'cat' && <Cat className="w-16 h-16 text-primary-600" />}
              {petType === 'bird' && <Bird className="w-14 h-14 text-green-500" />}
            </motion.div>
            <motion.div
              className="mt-2 w-2 h-2 rounded-full bg-gray-400"
              animate={{
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.2,
                repeat: Infinity,
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

/**
 * Mascotas apareciendo desde los costados
 * Efecto de mascotas entrando a la escena
 */
export const PetsEntering = ({ className = '' }: { className?: string }) => {
  const enterVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: i * 0.3,
        duration: DURATIONS.slow / 1000,
        ease: 'easeOut'
      }
    })
  };

  const petTypes = [
    { icon: Dog, color: 'text-primary-500', label: 'Perro' },
    { icon: Cat, color: 'text-primary-600', label: 'Gato' },
    { icon: Bird, color: 'text-green-500', label: 'Pájaro' }
  ];

  return (
    <div className={`flex justify-center items-center gap-6 ${className}`}>
      {petTypes.map((pet, i) => {
        const Icon = pet.icon;
        return (
          <motion.div
            key={i}
            custom={i}
            variants={enterVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            className="text-center"
          >
            <Icon className={`w-16 h-16 ${pet.color} mx-auto`} />
            <p className="text-sm text-gray-600 mt-2">{pet.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
};

/**
 * Flotador de mascotas en background
 * Mascotas moviéndose suavemente en el fondo
 */
export const FloatingPets = ({ className = '' }: { className?: string }) => {
  const floatVariants = {
    animate: (i: number) => ({
      y: [0, -30, 0],
      x: [0, 20, 0],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 6 + i,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    })
  };

  return (
    <div className={`relative w-full h-64 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          custom={i}
          variants={floatVariants}
          animate="animate"
          className="absolute"
          style={{
            left: `${20 + i * 30}%`,
            top: `${10 + i * 20}%`,
            opacity: 0.15
          }}
        >
          {i === 0 && <Dog className="w-24 h-24 text-primary-500" />}
          {i === 1 && <Cat className="w-20 h-20 text-primary-600" />}
          {i === 2 && <Bird className="w-16 h-16 text-green-500" />}
        </motion.div>
      ))}
    </div>
  );
};

/**
 * Pata caminante animada
 * Simula el movimiento de patas de un animal
 */
export const AnimatedPaw = ({ 
  className = '',
  speed = 0.6
}: { 
  className?: string;
  speed?: number;
}) => {
  const pawVariants = {
    animate: {
      rotate: [0, -10, 0, 10, 0],
      transition: {
        duration: speed,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <motion.svg
      className={`w-8 h-8 ${className}`}
      viewBox="0 0 24 24"
      fill="currentColor"
      variants={pawVariants}
      animate="animate"
      style={{ transformOrigin: 'center center' }}
    >
      {/* Centro de la pata */}
      <circle cx="12" cy="14" r="2.5" />
      {/* Dedos */}
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="4" cy="12" r="2" />
      <circle cx="20" cy="12" r="2" />
    </motion.svg>
  );
};

/**
 * Mascotas trotando múltiples
 * Grupo de mascotas caminando juntas
 */
export const PetsParade = ({ 
  count = 5,
  spacing = 'gap-4',
  className = ''
}: {
  count?: number;
  spacing?: string;
  className?: string;
}) => {
  const petTypes = ['dog', 'cat', 'bird'] as const;

  return (
    <div className={`flex overflow-hidden w-full ${spacing} ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <PetTrotting
          key={i}
          type={petTypes[i % 3]}
          speed={3000 + i * 200}
          delay={i * 0.5}
          className="flex-shrink-0"
        />
      ))}
    </div>
  );
};

/**
 * Indicador de animación de mascota
 * Punto que se anima cuando hay actividad de mascota
 */
export const PetActivityIndicator = ({ 
  active = true,
  className = ''
}: {
  active?: boolean;
  className?: string;
}) => {
  const pulseVariants = {
    animate: active ? {
      scale: [1, 1.2, 1],
      opacity: [1, 0.7, 1]
    } : {},
  };

  return (
    <motion.div
      className={`w-3 h-3 rounded-full bg-primary-500 ${className}`}
      variants={pulseVariants}
      animate={active ? 'animate' : undefined}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  );
};

