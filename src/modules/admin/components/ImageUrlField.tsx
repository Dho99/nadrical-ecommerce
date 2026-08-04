import { useState } from 'react'
import { Expand, ImageIcon } from 'lucide-react'
import { PRESET_IMAGES } from '../constants/admin.constants'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '../../../shared/components/ui'

function Preview({ src, label }: { src: string; label: string }) {
  const [failed, setFailed] = useState(false)
  if (!src) {
    return (
      <div className="flex aspect-square w-40 items-center justify-center rounded-lg border border-dashed bg-muted text-center">
        <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
          <ImageIcon className="h-5 w-5" />
          No image yet
        </div>
      </div>
    )
  }
  if (failed) {
    return (
      <div className="flex aspect-square w-40 items-center justify-center rounded-lg border border-dashed border-destructive/50 bg-destructive/10 text-center">
        <div className="flex flex-col items-center gap-1 text-xs text-destructive">
          <ImageIcon className="h-5 w-5" />
          Unreachable image
        </div>
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={label}
      onError={() => setFailed(true)}
      className="aspect-square w-40 rounded-lg border object-cover"
    />
  )
}

export function ImageUrlField() {
  const [previewOpen, setPreviewOpen] = useState(false)

  return (
    <FormField
      name="imageUrl"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Image URL</FormLabel>
          <div className="flex flex-wrap items-start gap-4">
            <button
              type="button"
              onClick={() => field.value && setPreviewOpen(true)}
              disabled={!field.value}
              className="group relative rounded-lg disabled:cursor-not-allowed"
              title="Preview image"
            >
              <Preview src={field.value} label="Product preview" />
              {field.value && (
                <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Expand className="size-5 text-white" />
                </span>
              )}
            </button>
            <div className="min-w-0 flex-1 space-y-3">
              <FormControl>
                <Input
                  placeholder="https://images.unsplash.com/photo-…"
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormDescription>Paste any image URL, or pick a preset below.</FormDescription>
              <FormMessage />
            </div>
          </div>
          <div className="mt-2 grid grid-cols-5 gap-2 sm:grid-cols-10 lg:grid-cols-5 xl:grid-cols-10">
            {PRESET_IMAGES.map((preset) => {
              const selected = field.value === preset.url
              return (
                <button
                  key={preset.id}
                  type="button"
                  title={preset.label}
                  onClick={() => field.onChange(preset.url)}
                  className={`group relative aspect-square overflow-hidden rounded-md border bg-muted ${
                    selected
                      ? 'border-primary ring-2 ring-primary'
                      : 'border-border hover:border-primary/60'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    loading="lazy"
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                  <span className="sr-only">{preset.label}</span>
                </button>
              )
            })}
          </div>

          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent className="max-w-[min(88vw,44rem)] p-3">
              <DialogTitle className="sr-only">Image preview</DialogTitle>
              <img
                src={field.value}
                alt="Product preview"
                className="max-h-[80vh] w-full rounded-md object-contain"
              />
            </DialogContent>
          </Dialog>
        </FormItem>
      )}
    />
  )
}
