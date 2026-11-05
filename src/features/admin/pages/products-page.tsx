import { useDeferredValue, useState } from "react";
import { Package, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageSpinner } from "@/components/feedback/page-spinner";
import { Price } from "@/components/product/price";
import { ProductImage } from "@/components/product/product-image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { brandLabel, categoryLabel, LOW_STOCK_THRESHOLD } from "@/config/catalog";
import { getErrorMessage } from "@/lib/api/errors";
import { productImages } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/api";
import { useDeleteProductMutation, useGetAdminProductsQuery } from "../admin-api";
import { AdminHeading } from "../components/admin-layout";
import { ProductFormSheet } from "../components/product-form-sheet";

export default function AdminProductsPage() {
  const { data: products = [], isLoading } = useGetAdminProductsQuery();
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query.trim().toLowerCase());
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [remove, { isLoading: removing }] = useDeleteProductMutation();

  const filtered = deferred
    ? products.filter((p) =>
        [p.title, brandLabel(p.brand), categoryLabel(p.category)].some((s) =>
          s.toLowerCase().includes(deferred),
        ),
      )
    : products;

  return (
    <>
      <AdminHeading
        title="Products"
        description={`${products.length} products in the catalogue.`}
        action={
          <Button size="md" className="text-[15px]" onClick={() => setCreating(true)}>
            <Plus size={16} strokeWidth={2} aria-hidden="true" /> Add product
          </Button>
        }
      />

      <label className="flex h-11 max-w-[420px] items-center gap-2.5 rounded-md border border-input bg-card px-3.5 text-muted-foreground focus-within:border-primary">
        <Search size={18} aria-hidden="true" />
        <input
          type="search"
          aria-label="Filter products"
          placeholder="Filter by name, brand or category"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none"
        />
      </label>

      {isLoading ? (
        <PageSpinner className="min-h-[30vh]" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title={products.length ? "No products match" : "No products yet"}
          body={
            products.length ? "Try a different search." : "Add your first product to start selling."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="hidden border-b border-border text-left text-[13px] text-muted-foreground md:table-header-group">
              <tr>
                <th className="py-3 pl-5 font-medium">Product</th>
                <th className="py-3 font-medium">Category</th>
                <th className="py-3 font-medium">Price</th>
                <th className="py-3 font-medium">Stock</th>
                <th className="py-3 pr-5 text-right font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p._id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border p-4 last:border-0 md:table-row md:p-0"
                >
                  <td className="flex min-w-0 flex-1 items-center gap-3 md:py-3 md:pl-5">
                    <ProductImage
                      src={productImages(p)[0]}
                      alt=""
                      category={p.category}
                      iconSize={22}
                      iconStroke={1.2}
                      className="size-12 flex-none rounded-md"
                    />
                    <div className="min-w-0">
                      <div className="truncate font-medium">{p.title}</div>
                      <div className="text-[13px] text-muted-foreground">{brandLabel(p.brand)}</div>
                    </div>
                  </td>
                  <td className="hidden text-ink-2 md:table-cell">{categoryLabel(p.category)}</td>
                  <td>
                    <Price
                      price={p.price}
                      salePrice={p.salePrice}
                      className="text-sm"
                      wasClassName="text-xs"
                    />
                  </td>
                  <td>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-semibold",
                        p.totalStock <= 0
                          ? "bg-destructive/10 text-destructive"
                          : p.totalStock < LOW_STOCK_THRESHOLD
                            ? "bg-warning-soft text-warning"
                            : "bg-success-soft text-success",
                      )}
                    >
                      {p.totalStock <= 0 ? "Out of stock" : `${p.totalStock} in stock`}
                    </span>
                  </td>
                  <td className="ml-auto md:pr-5 md:text-right">
                    <span className="flex justify-end gap-1">
                      <Button
                        variant="outline"
                        size="md"
                        className="h-9"
                        onClick={() => setEditing(p)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="link-destructive"
                        className="h-9 px-2 text-sm"
                        onClick={() => setDeleting(p)}
                      >
                        Delete
                      </Button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProductFormSheet
        open={creating || !!editing}
        product={editing ?? undefined}
        onOpenChange={(o) => {
          if (!o) {
            setCreating(false);
            setEditing(null);
          }
        }}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleting?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              It disappears from the store and from customers' carts and wishlists. Past orders keep
              their record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              disabled={removing}
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() =>
                deleting &&
                remove(deleting._id)
                  .unwrap()
                  .then(() => toast("Product deleted"))
                  .catch((e) => toast.error(getErrorMessage(e)))
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
