import { PageShell } from "@/components/page-shell";
import { ProductForm } from "./product-form";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <PageShell title="New product" subtitle="Create a new affiliate destination.">
      <ProductForm />
    </PageShell>
  );
}
