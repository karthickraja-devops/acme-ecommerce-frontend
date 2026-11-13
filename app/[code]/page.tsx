
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken } from "@/lib/auth";
import DeleteProductButton from "@/components/delete-product";
import ProductCard from "@/components/product-card";
import { products as productMetadata } from "@/lib/products";
import { getProductsFromApi, type ApiProduct } from "@/lib/products-api";

import Link from "next/link";
import Image from "next/image";


type StoreProduct = ApiProduct & {
  slug: string;
  imageAlt: string;
  summary: string;
};

export default async function Home(props: {
  params: Promise<{ code: string }>;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken || !(await verifyAccessToken(accessToken))) {
    redirect("/api/auth/login");
  }

  const params = await props.params;

  const showPromoBanner = false;

  // Load active products from NestJS / MySQL.
  const apiProducts = await getProductsFromApi();

  // Keep the existing static file only for slug and presentation metadata.
  const storeProducts: StoreProduct[] = apiProducts.flatMap((apiProduct) => {
    const metadata = productMetadata.find(
      (item) => Number(item.id) === apiProduct.id
    );

    if (!metadata) return [];

    return [{
      ...apiProduct,
      slug: metadata.slug,
      imageAlt: metadata.imageAlt,
      summary: metadata.summary,
    }];
  });

  const heroProduct = storeProducts[0];
  const popularProducts = storeProducts.slice(1);

  return (
    <main className="min-h-screen max-w-5xl py-6 mx-auto">
      <div className="flex flex-col">
        {showPromoBanner && (
          <section className="flex w-full py-4 bg-amber-300 justify-center rounded-lg mx-4 md:mx-6 font-bold">
            Acme Sale Week is here! Get 20% off all products.
          </section>
        )}

        {heroProduct && (
          <section className="flex w-full py-4 md:py-8 lg:py-12 justify-center">
            <ProductHero product={heroProduct} />
          </section>
        )}

        <section className="flex flex-col w-full justify-center py-12 space-y-4 md:py-24 lg:py-32 px-4 md:px-6">
          <h2 className="text-xl font-bold tracking-tighter sm:text-2xl md:text-3xl">
            Popular Products
          </h2>

          {popularProducts.length > 0 ? (
            <div className="container grid grid-cols-1 mx-auto md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: String(product.id),
                    imageSrc: product.imageUrl || "",
                    imageAlt: product.imageAlt,
                    title: product.name,
                    price: Number(product.price),
                    slug: product.slug,
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No other products are available.</p>
          )}
        </section>
      </div>
    </main>
  );
}


function ProductHero({ product }: { product: StoreProduct }) {
  return (
    <div className="container px-4 md:px-6">
      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
        {product.imageUrl && (
          <Image
            alt={product.imageAlt}
            className="object-cover rounded-lg bg-slate-300"
            height={500}
            width={500}
            src={product.imageUrl}
          />
        )}

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            {product.name}
          </h1>

          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            {product.summary}
          </p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              prefetch={true}
              className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90"
              href={`/product/${product.slug}`}
            >
              View Product
            </Link>

            <DeleteProductButton productId={Number(product.id)} />
          </div>
        </div>
      </div>
    </div>
  );
}
