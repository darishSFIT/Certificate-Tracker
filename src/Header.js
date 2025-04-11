import React from 'react';
import { Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon, HomeIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function Header({ onAddClick, onSearchClick, showAddForm, showSearchForm, darkMode, setDarkMode }) {
  // Navigation items
  const navigation = [
    { 
      name: 'Home', 
      icon: <HomeIcon className="w-5 h-5 mr-2" aria-hidden="true" />, 
      onClick: () => {
        // Reset state without page reload to preserve dark mode
        if (showAddForm || showSearchForm) {
          // Only update if not already on home
          onAddClick(false);
          onSearchClick(false);
        }
      }, 
      current: !showAddForm && !showSearchForm 
    },
    { 
      name: 'Add Certificate', 
      icon: <PlusIcon className="w-5 h-5 mr-2" aria-hidden="true" />, 
      onClick: () => onAddClick(), 
      current: showAddForm 
    },
    { 
      name: 'Verify Certificate', 
      icon: <MagnifyingGlassIcon className="w-5 h-5 mr-2" aria-hidden="true" />, 
      onClick: () => onSearchClick(),
      current: showSearchForm 
    },
  ]

  return (
    <Disclosure as="nav" className={`fixed top-0 left-0 w-full z-50 ${darkMode ? 'bg-black' : 'bg-gray-800'}`}>
      {({ open }) => (
        <>
          <div className="w-full px-0 sm:px-0">
            <div className="relative flex h-16 items-center justify-between">
              {/* Mobile menu button - absolute positioned at left edge */}
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden pl-2">
                <Disclosure.Button className="group relative inline-flex items-center justify-center rounded-full p-2 text-gray-400 hover:bg-gray-900 hover:text-blue-400 focus:ring-2 focus:ring-blue-400 focus:outline-hidden focus:ring-inset">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>

              {/* Logo and title - aligned to left edge */}
              <div className="flex-none items-center ml-4 sm:ml-6">
                <div className="flex items-center">
                  <img
                    className="h-8 w-auto"
                    src={process.env.PUBLIC_URL + '/logo192.png'}
                    alt="Certificate Tracker"
                  />
                  <span className={`ml-2 text-lg font-bold hidden sm:block ${darkMode ? 'text-blue-400' : 'text-white'}`}>
                    Certificate Tracker
                  </span>
                </div>
              </div>

              {/* Right-aligned navigation and dark mode */}
              <div className="flex-none flex items-center space-x-3 mr-4 sm:mr-6">
                {/* Navigation buttons - now right aligned */}
                <div className="hidden sm:block">
                  <div className="flex space-x-3">
                    {navigation.map((item) => (
                      <button
                        key={item.name}
                        onClick={item.onClick}
                        className={classNames(
                          item.current 
                            ? `bg-blue-600 text-white shadow-lg ${darkMode ? 'shadow-blue-500/50' : 'shadow-blue-500/50'}` 
                            : `${darkMode ? 'bg-gray-900 text-blue-200 hover:bg-gray-800 hover:text-blue-400' : 'bg-indigo-400/20 text-indigo-100 hover:bg-indigo-500 hover:text-white'}`,
                          'rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 min-w-[140px] flex items-center justify-center',
                          item.current ? 'ring-2 ring-blue-400 ring-opacity-75' : ''
                        )}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dark mode toggle */}
                <button
                  type="button"
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative rounded-full ${darkMode ? 'bg-gray-900 text-blue-400 hover:text-blue-300' : 'bg-gray-700 text-gray-300 hover:text-white'} p-1 focus:outline-none`}
                >
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">Toggle dark mode</span>
                  {darkMode ? (
                    <SunIcon className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MoonIcon className="h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className={`space-y-1 px-2 pt-2 pb-3 ${darkMode ? 'bg-black' : ''}`}>
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="button"
                  onClick={item.onClick}
                  className={classNames(
                    item.current 
                      ? `bg-blue-600 text-white shadow-md ${darkMode ? 'shadow-blue-500/50' : 'shadow-indigo-500/50'}` 
                      : `${darkMode ? 'bg-gray-900 text-blue-200 hover:bg-gray-800 hover:text-blue-400' : 'bg-indigo-400/20 text-indigo-100 hover:bg-indigo-500 hover:text-white'}`,
                    'block rounded-full px-4 py-2.5 text-base font-medium w-full text-left flex items-center',
                    item.current ? 'ring-2 ring-blue-400 ring-opacity-75' : ''
                  )}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

export default Header; 