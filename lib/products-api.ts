
export type ApiProduct = {
  id: number;
  name: string;
  description: string | null;
  price: string | number;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
};

const API_URL = process.env.NEST_API_URL;

export async function getProductsFromApi(): Promise<ApiProduct[]> {
  if (!API_URL) {
    throw new Error('NEST_API_URL is not configured');
  }

  const response = await fetch(`${API_URL}/products`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`);
  }

  return response.json();
}

export async function getProductFromApi(
  id: string | number,
): Promise<ApiProduct | undefined> {
  const products = await getProductsFromApi();

  return products.find((product) => product.id === Number(id));
}
