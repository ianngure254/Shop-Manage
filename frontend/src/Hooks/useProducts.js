import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productAPI } from '../api/product.api';
import toast from 'react-hot-toast';

export const useProducts = () => {
  const queryClient = useQueryClient();

  // Query for fetching products
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: () => productAPI.getAll(),
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  // Mutation for updating products
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => productAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update product');
      console.error('Update error:', error);
    }
  });

  // Mutation for adding products
  const addMutation = useMutation({
    mutationFn: (data) => productAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add product');
      console.error('Add error:', error);
    }
  });

  // Mutation for deleting products
  const deleteMutation = useMutation({
    mutationFn: (id) => productAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete product');
      console.error('Delete error:', error);
    }
  });

  // Extract products data safely
  const products = data?.data?.data?.products || data?.data?.products || [];

  return {
    products,
    loading: isLoading,
    error,
    fetchProducts: refetch,
    updateProduct: async (id, data) => {
      try {
        await updateMutation.mutateAsync({ id, data });
        return true;
      } catch (error) {
        return false;
      }
    },
    addProduct: async (data) => {
      try {
        const result = await addMutation.mutateAsync(data);
        return result?.data?.data?.product || result?.data?.product || result?.data;
      } catch (error) {
        return null;
      }
    },
    deleteProduct: async (id) => {
      try {
        await deleteMutation.mutateAsync(id);
        return true;
      } catch (error) {
        return false;
      }
    }
  };
};
