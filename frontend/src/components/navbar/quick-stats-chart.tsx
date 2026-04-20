/**
 * Shopping Cart Component
 * Shows shopping cart icon with badge and dropdown with cart items
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type ShoppingCartProps = {
  className?: string;
};

export function ShoppingCart({ className }: ShoppingCartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock cart items - in production, fetch from API/context
  const cartItems: CartItem[] = [
    {
      id: '1',
      name: 'Premium Course',
      price: 99.99,
      quantity: 1,
    },
    {
      id: '2',
      name: 'Advanced Training',
      price: 149.99,
      quantity: 1,
    },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-primary/10 dark:hover:bg-slate-700 transition-colors text-[#2E417B] dark:text-slate-300"
        title="Shopping Cart"
        aria-label="Shopping Cart"
      >
        {/* Cart Icon */}
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>

        {/* Badge */}
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {itemCount > 9 ? '9+' : itemCount}
          </span>
        )}
      </button>

      {/* Cart Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-800 border border-primary/15 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden z-50 mx-2 sm:mx-0 max-w-[calc(100vw-1rem)]"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-primary/15 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <h3 className="text-sm font-semibold text-primary dark:text-slate-100">
              Shopping Cart
            </h3>
            <p className="text-xs text-primary/60 dark:text-slate-400 mt-1">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in cart
            </p>
          </div>

          {/* Cart Items */}
          <div className="max-h-64 overflow-y-auto">
            {cartItems.length > 0 ? (
              <div className="divide-y divide-primary/10 dark:divide-slate-700">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex gap-3">
                      {/* Item Image Placeholder */}
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-primary/10 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-6 h-6 text-primary/60 dark:text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1V4zM6 14a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1v-2z"
                            />
                          </svg>
                        </div>
                      )}

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary dark:text-slate-100 truncate">
                          {item.name}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-primary/60 dark:text-slate-400">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-sm font-semibold text-primary dark:text-slate-100">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center">
                <svg
                  className="w-12 h-12 mx-auto text-primary/30 dark:text-slate-600 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-sm text-primary/60 dark:text-slate-400">
                  Your cart is empty
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <>
              <div className="border-t border-primary/15 dark:border-slate-700 px-4 py-3 bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-primary dark:text-slate-200">
                    Subtotal
                  </span>
                  <span className="text-lg font-bold text-primary dark:text-slate-100">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <Link
                  href="/cart"
                  className="block w-full"
                  onClick={() => setIsOpen(false)}
                >
                  <Button className="w-full rounded-lg bg-[#2E417B] hover:bg-[#1f2a52] text-white dark:bg-blue-600 dark:hover:bg-blue-700">
                    View Cart
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
