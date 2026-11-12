
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";

import { verifyAccessToken } from "@/lib/auth";
import { getProductsFromApi } from "@/lib/products-api";
import { formatUSD } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import RemoveCartItem from "@/components/remove-cart-item";

export const dynamic = "force-dynamic";

type CartItem = {
  cartItemId: number;
  quantity: number;
  selectedSize: string | null;
  product: {
    id: number;
    name: string;
    price: string | number;
    stock: number;
    imageUrl: string | null;
  };
};

export default async function CartPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const apiUrl = process.env.NEST_API_URL;

  if (!accessToken || !(await verifyAccessToken(accessToken))) {
    redirect("/api/auth/login");
  }

  if (!apiUrl) {
    throw new Error("NEST_API_URL is not configured");
  }

  const cartResponse = await fetch(`${apiUrl}/cart`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!cartResponse.ok) {
    throw new Error(`Could not load cart: ${cartResponse.status}`);
  }

  const cart = await cartResponse.json();
  const items: CartItem[] = cart?.items ?? [];

  // The products endpoint returns signed S3 image URLs.
  const activeProducts = await getProductsFromApi();

  const productsWithImages = items.map((item) => {
    const activeProduct = activeProducts.find(
      (product) => product.id === item.product.id,
    );

    return {
      ...item,
      imageUrl: activeProduct?.imageUrl ?? null,
    };
  });

  const subtotal = productsWithImages.reduce(
    (total, item) =>
      total + Number(item.product.price) * item.quantity,
    0,
  );

  const shipping = productsWithImages.length > 0 ? 4.99 : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return (
    <main className="max-w-5xl mx-auto py-6 px-4 md:px-6">
      <h1 className="font-bold text-3xl lg:text-4xl">Shopping Cart</h1>

      <section className="grid md:grid-cols-2 gap-6 lg:gap-12 items-start py-4 md:py-8 lg:py-12">
        <Card>
          <CardHeader>
            <CardTitle>Cart Summary</CardTitle>
          </CardHeader>

          <CardContent>
            {productsWithImages.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <div className="space-y-5">
                {productsWithImages.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="flex items-center gap-4"
                  >
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="rounded-md h-16 w-16 object-contain"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-md bg-gray-100" />
                    )}

                    <div className="grid gap-1 flex-1">
                      <div className="flex justify-between gap-2">
                        <span className="font-medium">
                          {item.product.name}
                        </span>
                        <RemoveCartItem cartItemId={item.cartItemId} />
                      </div>

                      {item.selectedSize && (
                        <p className="text-sm text-gray-500">
                          Size: {item.selectedSize.toUpperCase()}
                        </p>
                      )}

                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>

                      <p>
                        {formatUSD(Number(item.product.price) * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>

          <CardFooter>
            <p className="text-xl font-semibold">
              Subtotal: {formatUSD(subtotal)}
            </p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatUSD(subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatUSD(shipping)}</span>
              </div>

              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatUSD(tax)}</span>
              </div>

              <div className="flex justify-between font-bold text-lg pt-3">
                <span>Total</span>
                <span>{formatUSD(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
