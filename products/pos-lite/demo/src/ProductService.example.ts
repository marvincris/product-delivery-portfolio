/**
 * Product Service
 * 
 * Business logic for product management in the POS system.
 * Demonstrates service layer pattern and clean separation of concerns.
 * 
 * Human Decision: Service layer architecture for testability and maintainability
 * AI Contribution: Generated boilerplate, human added business logic and error handling
 */

import { Product, CreateProductDTO, UpdateProductDTO } from '../models/Product';
import { ProductRepository } from '../repositories/ProductRepository';
import { ValidationError, NotFoundError } from '../utils/errors';

export class ProductService {
  constructor(private productRepository: ProductRepository) {}

  /**
   * Create a new product
   * 
   * @param data - Product creation data
   * @returns Created product
   * @throws ValidationError if SKU already exists or data is invalid
   */
  async createProduct(data: CreateProductDTO): Promise<Product> {
    // Validate SKU uniqueness (human-designed business rule)
    const existingProduct = await this.productRepository.findBySKU(data.sku);
    if (existingProduct) {
      throw new ValidationError(`Product with SKU ${data.sku} already exists`);
    }

    // Validate business rules (human-designed constraints)
    if (data.price < 0) {
      throw new ValidationError('Price cannot be negative');
    }

    if (data.quantity < 0) {
      throw new ValidationError('Quantity cannot be negative');
    }

    if (data.reorderLevel && data.reorderLevel < 0) {
      throw new ValidationError('Reorder level cannot be negative');
    }

    // Create product (AI-generated repository call, human-reviewed)
    return await this.productRepository.create(data);
  }

  /**
   * Get product by ID
   * 
   * @param id - Product UUID
   * @returns Product if found
   * @throws NotFoundError if product doesn't exist
   */
  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    
    if (!product) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }

    return product;
  }

  /**
   * Get product by SKU
   * 
   * @param sku - Product SKU
   * @returns Product if found
   * @throws NotFoundError if product doesn't exist
   */
  async getProductBySKU(sku: string): Promise<Product> {
    const product = await this.productRepository.findBySKU(sku);
    
    if (!product) {
      throw new NotFoundError(`Product with SKU ${sku} not found`);
    }

    return product;
  }

  /**
   * Search products by name or SKU
   * 
   * @param query - Search query
   * @param options - Pagination and filter options
   * @returns List of matching products
   */
  async searchProducts(
    query: string,
    options: {
      limit?: number;
      offset?: number;
      activeOnly?: boolean;
    } = {}
  ): Promise<{ products: Product[]; total: number }> {
    const { limit = 20, offset = 0, activeOnly = true } = options;

    return await this.productRepository.search(query, {
      limit,
      offset,
      activeOnly,
    });
  }

  /**
   * Update product
   * 
   * @param id - Product UUID
   * @param data - Update data
   * @returns Updated product
   * @throws NotFoundError if product doesn't exist
   * @throws ValidationError if update data is invalid
   */
  async updateProduct(id: string, data: UpdateProductDTO): Promise<Product> {
    // Check product exists
    const existingProduct = await this.getProductById(id);

    // Validate SKU uniqueness if changing SKU (human-designed logic)
    if (data.sku && data.sku !== existingProduct.sku) {
      const productWithSKU = await this.productRepository.findBySKU(data.sku);
      if (productWithSKU && productWithSKU.id !== id) {
        throw new ValidationError(`Product with SKU ${data.sku} already exists`);
      }
    }

    // Validate business rules (human-designed constraints)
    if (data.price !== undefined && data.price < 0) {
      throw new ValidationError('Price cannot be negative');
    }

    if (data.reorderLevel !== undefined && data.reorderLevel < 0) {
      throw new ValidationError('Reorder level cannot be negative');
    }

    // Update product
    return await this.productRepository.update(id, data);
  }

  /**
   * Deactivate product (soft delete)
   * 
   * Human Decision: Soft delete to preserve audit trail
   * 
   * @param id - Product UUID
   * @returns Deactivated product
   * @throws NotFoundError if product doesn't exist
   */
  async deactivateProduct(id: string): Promise<Product> {
    return await this.updateProduct(id, { isActive: false });
  }

  /**
   * Check if product is low stock
   * 
   * @param id - Product UUID
   * @returns True if stock is at or below reorder level
   */
  async isLowStock(id: string): Promise<boolean> {
    const product = await this.getProductById(id);
    
    if (!product.reorderLevel) {
      return false;
    }

    return product.quantity <= product.reorderLevel;
  }

  /**
   * Get all low stock products
   * 
   * @returns List of products at or below reorder level
   */
  async getLowStockProducts(): Promise<Product[]> {
    return await this.productRepository.findLowStock();
  }

  /**
   * Update product quantity (for inventory management)
   * 
   * Note: This is called by TransactionService when a sale is made
   * Human Decision: Atomic quantity updates to prevent race conditions
   * 
   * @param id - Product UUID
   * @param quantityChange - Positive or negative quantity change
   * @returns Updated product
   * @throws NotFoundError if product doesn't exist
   * @throws ValidationError if resulting quantity would be negative
   */
  async updateQuantity(id: string, quantityChange: number): Promise<Product> {
    const product = await this.getProductById(id);

    const newQuantity = product.quantity + quantityChange;

    if (newQuantity < 0) {
      throw new ValidationError(
        `Cannot reduce quantity below zero. Current: ${product.quantity}, Change: ${quantityChange}`
      );
    }

    return await this.productRepository.updateQuantity(id, quantityChange);
  }
}
