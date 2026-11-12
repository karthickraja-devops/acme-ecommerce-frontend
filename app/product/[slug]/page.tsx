
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import { verifyAccessToken } from "@/lib/auth";
import { products as productMetadata } from "@/lib/products";
import { getProductsFromApi } from "@/lib/products-api";
import ProductCard from "@/components/product-card";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken || !(await verifyAccessToken(accessToken))) {
    redirect("/api/auth/login");
  }

  // Fetch all active products from NestJS.
  const apiProducts = await getProductsFromApi();

  // Use the static metadata only for slugs and image descriptions.
  const storeProducts = apiProducts.flatMap((product) => {
    const metadata = productMetadata.find(
      (item) => Number(item.id) === product.id
    );

    if (!metadata) return [];

    return [{
      id: String(product.id),
      imageSrc: product.imageUrl || "",
      imageAlt: metadata.imageAlt,
      title: product.name,
      price: Number(product.price),
      slug: metadata.slug,
    }];
  });

  return (
    <main className="min-h-screen max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">All Products</h1>

        <Link
          href="/"
          className="text-sm underline"
        >
          Back to Home
        </Link>
      </div>

      {storeProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {storeProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">
          No active products are currently available.
        </p>
      )}
    </main>
  );
}
