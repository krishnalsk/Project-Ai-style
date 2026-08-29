import { MOCK_PRODUCTS } from "@/lib/products";
import ProductDetailClient from "./ProductDetailClient";

export function generateStaticParams() {
  return MOCK_PRODUCTS.map((p) => ({
    id: p.id,
  }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductDetailClient id={id} />;
}
