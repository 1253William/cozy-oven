import { useState } from "react";
import productService, { UpdateProductData } from "../services/productService";

export const useProductManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);



  const createProductWithImage = async (formData: FormData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const response = await productService.createProductWithImage(formData);
      setSuccess("Product created successfully!");
      return response;
    } catch (err) {
      console.error("Error creating product:", err);
      setError("Failed to create product. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (productId: string, productData: UpdateProductData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const response = await productService.updateProduct(productId, productData);
      setSuccess("Product updated successfully!");
      return response;
    } catch (err) {
      console.error("Error updating product:", err);
      setError("Failed to update product. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProductWithImage = async (productId: string, formData: FormData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const response = await productService.updateProductWithImage(productId, formData);
      setSuccess("Product updated successfully!");
      return response;
    } catch (err) {
      console.error("Error updating product:", err);
      setError("Failed to update product. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const response = await productService.deleteProduct(productId);
      setSuccess("Product deleted successfully!");
      return response;
    } catch (err) {
      console.error("Error deleting product:", err);
      setError("Failed to delete product. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return {
    loading,
    error,
    success,
    createProductWithImage,
    updateProduct,
    updateProductWithImage,
    deleteProduct,
    clearMessages,
  };
};

export default useProductManagement;
