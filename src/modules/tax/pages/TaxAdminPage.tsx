import { useTaxList } from '../hooks/useTax'
import { Loader, Pencil, Trash2 } from 'lucide-react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption, Button } from '../../../shared/components/ui'

export function TaxAdminPage() {
  const { taxes, loading, error } = useTaxList()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return <p className="text-destructive">{error}</p>
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="font-display text-2xl font-bold">Tax Management</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Rate (%)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {taxes.map((tax) => (
            <TableRow key={tax.uuid}>
              <TableCell>{tax.name}</TableCell>
              <TableCell>{tax.rate}</TableCell>
              <TableCell>{tax.status}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="outline" size="sm" disabled>
                  <Pencil className="size-3" />
                </Button>
                <Button variant="destructive" size="sm" disabled>
                  <Trash2 className="size-3" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableCaption>Tax rates are read‑only in this demo.</TableCaption>
      </Table>
    </div>
  )
}
