import { useApi } from "@/lib/api";
import { Product } from "@/types";
import { useQuery } from "@tanstack/react-query";

const useProducts = () => {
  const api = useApi();

  const result = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        const { data } = await api.get<Product[]>("/products");
        console.log("Products data:", data);
        return data;
      } catch (error: any) {
        console.log("Error:", error.message);
        console.log("Error response:", error.response?.data);
        console.log("Error status:", error.response?.status);
        throw error;
      }
    },
  });

  return result;
};

export default useProducts;
