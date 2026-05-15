'use client';

import { motion } from 'framer-motion';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Kicker } from './Kicker';

interface SectionHeaderProps {
  kicker?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

/**
 * SectionHeader — kicker + headline + sub.
 * Animates in with stagger using framer-motion when in view.
 */
export function SectionHeader({
  kicker,
  title,
  description,
  align = 'left',
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 md:gap-5',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      {kicker && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Kicker align={align}>{kicker}</Kicker>
        </motion.div>
      )}
      <motion.h2
        className="headline-section text-fade text-balance max-w-3xl"
        initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, margin: '-15% 0px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          className="max-w-xl text-[16px] leading-relaxed text-ink-300 text-pretty md:text-[17px]"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}
