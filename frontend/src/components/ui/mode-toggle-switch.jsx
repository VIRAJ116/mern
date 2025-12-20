import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/context/theme-context'

export function ModeToggleSwitch() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className={'cursor-pointer'} onClick={() => setTheme('light')}>
          Light
        </div>
        <div className={'cursor-pointer'} onClick={() => setTheme('dark')}>
          Dark
        </div>
        <div className={'cursor-pointer'} onClick={() => setTheme('system')}>
          System
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
