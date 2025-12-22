import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ThemeToggleButton } from '@/components/common/ThemeToggleButton'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useMutation } from '@tanstack/react-query'
import { logout } from '@/services/auth'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function SiteHeader() {
  const queryClient = useQueryClient()
  const { mutate } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      toast.success('Logout successful')
      queryClient.resetQueries({ queryKey: ['me'] })
    },
  })
  const handleLogout = () => {
    mutate()
  }
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        {/* <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        /> */}
        {/* <h1 className="text-base font-medium">Dashboard</h1> */}
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggleButton />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleLogout} variant="outline" size="icon">
                <LogOut />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Logout</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  )
}
