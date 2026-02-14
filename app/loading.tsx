export default function Loading() {
  return (
    <div className="min-h-screen animate-pulse bg-background">
      <div className="border-b bg-background/95 h-16" />
      <div className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="mx-auto h-10 w-3/4 max-w-md rounded bg-muted" />
            <div className="mx-auto h-6 w-1/2 max-w-sm rounded bg-muted" />
          </div>
          <div className="flex justify-center gap-4">
            <div className="h-11 w-32 rounded-lg bg-muted" />
            <div className="h-11 w-40 rounded-lg bg-muted" />
          </div>
        </div>
      </div>
      <div className="border-b bg-muted/50 py-12">
        <div className="container mx-auto grid gap-8 px-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="h-3 w-32 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="container mx-auto space-y-16 px-4 py-16">
        <div className="space-y-8 text-center">
          <div className="mx-auto h-9 w-48 rounded bg-muted" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="overflow-hidden rounded-lg border">
                <div className="aspect-square bg-muted" />
                <div className="space-y-2 p-4">
                  <div className="h-5 w-3/4 rounded bg-muted" />
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-1/2 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
