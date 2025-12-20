import { useTheme } from '@/context/theme-context'
import { Moon, Sun } from 'lucide-react'
import { Button } from '../ui/button'

export const ThemeToggleButton = () => {
  const { toggleTheme } = useTheme()

  return (
    <Button variant="ghost  " size="icon" onClick={toggleTheme}>
      <Sun className="dark:hidden" />
      <Moon className="hidden dark:block" />
    </Button>
  )
}
