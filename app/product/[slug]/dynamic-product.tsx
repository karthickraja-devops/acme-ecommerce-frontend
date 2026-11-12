
import { buttonVariants } from "@/components/ui/button";
import ButtonSkeleton from "@/components/ui/button-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { products as productMetadata } from "@/lib/products";
import { getProductFromApi } from "@/lib/products-api";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { formatUSD } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { showBuyNowFlag } from "@/lib/flags";
import AddToCartButton from "@/components/add-to-cart";
import BuyNowButton from "@/components/buy-now";
import { FlagValues } from "flags/react";
import { notFound, redirect } from "next/navigation";
import DeleteProductButton from "@/components/delete-product";

export const DynamicProduct = async (props: {
  params: Promise<{ slug: string }>;
}) => {
  const params = await props.params;

  // Find the existing slug-to-ID mapping.
  const metadata = productMetadata.find(
    (item) => item.slug === params.slug
  );

  if (!metadata) {
    notFound();
  }

  // Fetch the current active product from NestJS.
  const product = await getProductFromApi(metadata.id);

  // If the product was deleted, return the user to the listing.
  if (!product || !product.isActive) {
    redirect("/products");
  }

  return (
    <>
      <div className="grid md:grid-cols-5 gap-3">
        <div className="md:col-span-4">
          {product.imageUrl && (
            <Image
              alt={metadata.imageAlt}
              className="object-contain w-full rounded-lg overflow-hidden bg-slate-300"
              height={500}
              width={500}
              src={product.imageUrl}
            />
          )}
        </div>
      </div>

      <div className="grid gap-4 md:gap-10">
        <div className="md:flex items-start">
          <div className="grid gap-4">
            <h1 className="font-bold text-3xl lg:text-4xl">
              {product.name}
            </h1>

            <div>
              <p>{product.description || metadata.details}</p>

              <p className="mt-2">
                {product.stock > 0
                  ? `${product.stock} left in stock`
                  : "Out of stock"}
              </p>
            </div>

            <div className="text-4xl font-bold ml-auto">
              {formatUSD(Number(product.price))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:gap-10">
          <div className="grid gap-2">
            <Label className="text-base" htmlFor="color">
              Color
            </Label>

            <RadioGroup
              className="flex items-center gap-2"
              defaultValue="black"
              id="color"
            >
              <Label
                className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-gray-100"
                htmlFor="color-black"
              >
                <RadioGroupItem id="color-black" value="black" />
                Black
              </Label>
            </RadioGroup>
          </div>



          <RadioGroup
            className="flex items-center gap-2"
            defaultValue="m"
            id="size"
          >
            <Label
              className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-gray-100"
              htmlFor="size-xs"
            >
              <RadioGroupItem id="size-xs" value="xs" />
              XS
            </Label>

            <Label
              className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-gray-100"
              htmlFor="size-s"
            >
              <RadioGroupItem id="size-s" value="s" />
              S
            </Label>

            <Label
              className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-gray-100"
              htmlFor="size-m"
            >
              <RadioGroupItem id="size-m" value="m" />
              M
            </Label>

            <Label
              className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-gray-100"
              htmlFor="size-l"
            >
              <RadioGroupItem id="size-l" value="l" />
              L
            </Label>

            <Label
              className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-gray-100"
              htmlFor="size-xl"
            >
              <RadioGroupItem id="size-xl" value="xl" />
              XL
            </Label>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Suspense fallback={<ButtonSkeleton />}>
            <Purchase productId={String(product.id)} />
          </Suspense>

          <Link
            href="/cart"
            prefetch={true}
            className={`w-full ${buttonVariants({ variant: "outline" })}`}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            View Cart
          </Link>

          <DeleteProductButton productId={product.id} />
        </div>
      </div>
    </div >
    </>
  );
};

export const DynamicProductSkeleton = async () => {
  return (
    <>
      <div className="grid md:grid-cols-5 gap-3">
        <div className="md:col-span-4">
          <Skeleton className="w-full h-96 rounded-lg" />
        </div>
      </div>

      <div className="grid gap-4 md:gap-10">
        <div className="md:flex items-start">
          <div className="grid gap-4">
            <Skeleton className="w-96 h-6" />
            <Skeleton className="w-32 h-6" />
          </div>
        </div>

        <div className="grid gap-4 md:gap-10">
          <Skeleton className="w-20 h-6" />
          <Skeleton className="w-20 h-6" />
          <ButtonSkeleton />
        </div>
      </div>
    </>
  );
};

async function Purchase({ productId }: { productId: string }) {
  const showBuyNow = await showBuyNowFlag();
  const buttonText = showBuyNow?.buttonText || "Buy Now";

  return (
    <div className="flex flex-row w-full gap-1">
      <FlagValues values={{ [showBuyNowFlag.key]: showBuyNow }} />

      <AddToCartButton productId={productId} />

      {showBuyNow?.enabled && <BuyNowButton text={buttonText} />}
    </div>
  );
}
