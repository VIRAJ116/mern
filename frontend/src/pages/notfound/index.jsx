import { Link, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { IconArrowLeft, IconHome } from '@tabler/icons-react'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      {/* Decorative Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />

      <div className="relative z-10 text-center px-6">
        {/* Large 404 Text */}
        <h1 className="text-[12rem] font-bold leading-none tracking-tighter text-muted-foreground/20 select-none">
          404
        </h1>

        <div className="mt-[-4rem]">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Lost in the digital void?
          </h2>
          <p className="mt-4 text-base text-muted-foreground max-w-lg mx-auto">
            The page you're looking for doesn't exist or has been moved. Don't
            worry, even the best explorers get lost sometimes.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="gap-2 px-8">
            <Link to="/">
              <IconHome className="size-4" />
              Back to Home
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="gap-2 px-8">
            <button onClick={() => navigate(-1)}>
              <IconArrowLeft className="size-4" />
              Go Back
            </button>
          </Button>
        </div>
      </div>
    </div>
  )
}
