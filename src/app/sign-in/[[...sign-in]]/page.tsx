'use client';

import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import { motion } from 'framer-motion';

const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function SignInPage() {
  // Show fallback if Clerk is not configured
  if (!isClerkConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <p className="text-zinc-400">Authentication is not configured.</p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Back to Particle
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4">
      {/* Particle dot + Sign-in form container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col items-center"
      >
        {/* Particle dot - above the form with proper spacing */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <motion.div
            className="w-3 h-3 bg-white rounded-full"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.9, 1, 0.9],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>

        {/* Sign-in form */}
        <div>
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              cardBox: 'shadow-none border-none',
              card: 'bg-transparent shadow-none border-none rounded-none',
              header: 'text-center',
              headerTitle: 'text-white text-xl font-medium',
              headerSubtitle: 'text-zinc-400',
              socialButtonsBlockButton:
                'bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800/80 hover:border-zinc-700 text-white transition-all duration-200',
              socialButtonsBlockButtonText: 'text-white font-medium',
              dividerLine: 'bg-zinc-800',
              dividerText: 'text-zinc-500',
              formFieldLabel: 'text-zinc-400',
              formFieldInput:
                'bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600',
              formButtonPrimary:
                'bg-white text-black hover:bg-zinc-200 font-medium transition-colors',
              footer: 'bg-transparent border-none',
              footerAction: 'bg-transparent',
              footerActionLink: 'text-white hover:text-zinc-300 transition-colors',
              footerActionText: 'text-zinc-500',
              identityPreviewText: 'text-white',
              identityPreviewEditButton: 'text-zinc-400 hover:text-white',
              formFieldSuccessText: 'text-green-400',
              formFieldErrorText: 'text-red-400',
              alert: 'bg-zinc-900/50 border-zinc-800 text-zinc-300',
              alertText: 'text-zinc-300',
            },
            variables: {
              colorPrimary: '#ffffff',
              colorBackground: 'transparent',
              colorInputBackground: 'rgba(24, 24, 27, 0.5)',
              colorInputText: '#ffffff',
              colorTextOnPrimaryBackground: '#000000',
              colorText: '#ffffff',
              colorTextSecondary: '#a1a1aa',
              borderRadius: '0.75rem',
            },
          }}
        />
        </div>
      </motion.div>

      {/* Back to Particle link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8"
      >
        <Link
          href="/"
          className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
        >
          Back to Particle
        </Link>
      </motion.div>
    </div>
  );
}
