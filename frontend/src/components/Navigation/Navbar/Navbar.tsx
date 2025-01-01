import { ThemeToggle } from '@/components/ThemeToggle';

export function Navbar(props: { title?: string }) {
  return (
    <header className="flex w-full flex-row items-center justify-center align-middle">
      <div className="bg-theme-light mb-4 mt-3 flex h-16 items-center justify-between rounded-2xl border border-gray-200 px-4 sm:px-8 md:px-16 shadow-md backdrop-blur-md backdrop-saturate-150 dark:border-white/10 dark:bg-white/5 w-[90%] sm:w-[70%] md:w-[55%]">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/public/PictoPy_Logo.png"
              className="h-7"
              alt="PictoPy Logo"
            />
            <span className="text-theme-dark dark:text-theme-light font-sans text-base sm:text-lg font-bold drop-shadow-sm">
              PictoPy
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-theme-dark dark:text-theme-light font-sans text-sm sm:text-lg font-medium">
            Welcome {props.title || 'User'}
          </span>
          <ThemeToggle />
        </div>
      </div>
      <div className="mb-4 mt-3 flex h-16 items-center justify-between rounded-2xl border border-gray-200 px-16 shadow-lg backdrop-blur-lg backdrop-saturate-150 bg-gradient-to-r from-blue-500 to-purple-600 dark:border-white/10 dark:bg-gradient-to-r dark:from-gray-800 dark:to-black sm:w-[70%] md:w-[55%] transition-all duration-300 ease-in-out transform hover:scale-105">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/public/PictoPy_Logo.png"
              className="h-7 hover:opacity-80 transition-opacity duration-200"
              alt="PictoPy Logo"
            />
            <span className="text-white font-sans text-lg font-bold drop-shadow-sm hover:text-yellow-300 transition-colors duration-200">
              PictoPy
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white font-sans text-lg font-medium hover:text-yellow-300 transition-colors duration-200">
            Welcome {props.title || 'User'}
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
export default Navbar;
