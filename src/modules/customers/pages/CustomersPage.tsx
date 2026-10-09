import { useState } from 'react'
import { useCustomers } from '../hooks/useCustomers'
import { Button, Card, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shared/components/ui'

export function CustomersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const limit = 20
  const { items, total, loading, error, refetch } = useCustomers({ page, limit, search: debounced })
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-5 py-8 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">Daftar pelanggan dari backend (via VITE_API_BASE_URL). {total > 0 ? `${total} total` : ''}</p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch}>Refresh</Button>
      </div>

      <Card>
        <div className="p-4 flex gap-2">
          <Input
            placeholder="Search email / name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setDebounced(search)
                setPage(1)
              }
            }}
            className="max-w-sm"
          />
          <Button
            size="sm"
            onClick={() => {
              setDebounced(search)
              setPage(1)
            }}
          >
            Search
          </Button>
        </div>

        {error && (
          <div className="mx-4 mb-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
            <p className="mt-1 text-xs text-muted-foreground">Backend endpoint belum ada = tidak dibuat di repo ini. Aktifkan GET /auth/users di nadrical-compro-be dan set VITE_API_BASE_URL.</p>
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">{error ? 'Tidak ada data untuk ditampilkan.' : 'Belum ada customer.'}</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.full_name}</TableCell>
                    <TableCell className="font-mono text-xs">{c.email}</TableCell>
                    <TableCell>{c.phone || '—'}</TableCell>
                    <TableCell>{c.status || '—'}</TableCell>
                    <TableCell>{c.role_name || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex items-center justify-between p-4">
          <span className="text-xs font-mono text-muted-foreground">Page {page} / {totalPages} · {total} total</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
