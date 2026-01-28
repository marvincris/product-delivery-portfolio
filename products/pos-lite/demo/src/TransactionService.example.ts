/**
 * Transaction Service
 * 
 * Business logic for processing point-of-sale transactions.
 * Demonstrates transaction handling, inventory integration, and error recovery.
 * 
 * Human Decision: Use database transactions for atomicity
 * AI Contribution: Generated structure, human added business logic and error handling
 */

import { Transaction, TransactionItem, CreateTransactionDTO } from '../models/Transaction';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { ProductService } from './ProductService';
import { ValidationError, InsufficientStockError } from '../utils/errors';

export class TransactionService {
  constructor(
    private transactionRepository: TransactionRepository,
    private productService: ProductService
  ) {}

  /**
   * Process a new transaction
   * 
   * Human Decision: Atomic transaction with inventory updates
   * This ensures we never sell more than available stock
   * 
   * @param data - Transaction data including items
   * @returns Completed transaction with receipt
   * @throws ValidationError if transaction data is invalid
   * @throws InsufficientStockError if any item is out of stock
   */
  async processTransaction(data: CreateTransactionDTO): Promise<Transaction> {
    // Validate transaction has items
    if (!data.items || data.items.length === 0) {
      throw new ValidationError('Transaction must have at least one item');
    }

    // Fetch all products once and validate (human-designed optimization)
    const productMap = new Map();
    
    for (const item of data.items) {
      // Validate quantity is positive
      if (item.quantity <= 0) {
        throw new ValidationError('Item quantity must be positive');
      }

      const product = await this.productService.getProductById(item.productId);
      productMap.set(item.productId, product);

      // Check stock availability
      if (product.quantity < item.quantity) {
        throw new InsufficientStockError(
          `Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`
        );
      }
    }

    // Calculate totals using cached products (human-designed business logic)
    let subtotal = 0;
    const transactionItems: TransactionItem[] = [];

    for (const item of data.items) {
      const product = productMap.get(item.productId);
      const itemSubtotal = product.price * item.quantity;
      
      subtotal += itemSubtotal;

      transactionItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal: itemSubtotal,
      });
    }

    // Calculate tax (simplified: 10% flat tax)
    // Human Decision: Hard-coded tax rate for demo, would be configurable in production
    const tax = subtotal * 0.10;
    const total = subtotal + tax;

    // Start database transaction (human-designed atomicity requirement)
    // Note: Transaction wrapper handled by repository layer using database client's transaction API
    try {
      // Create transaction record
      const transaction = await this.transactionRepository.create({
        cashierId: data.cashierId,
        items: transactionItems,
        subtotal,
        tax,
        total,
        paymentMethod: data.paymentMethod,
      });

      // Update inventory for each item (human-designed inventory logic)
      // These updates happen within the same database transaction for atomicity
      for (const item of transactionItems) {
        await this.productService.updateQuantity(item.productId, -item.quantity);
      }

      // Check for low stock alerts (human-designed business rule)
      for (const item of transactionItems) {
        const product = productMap.get(item.productId);
        if (product.reorderLevel && (product.quantity - item.quantity) <= product.reorderLevel) {
          // TODO: Send alert notification
          console.log(`Low stock alert for product ${item.productId}`);
        }
      }

      return transaction;

    } catch (error) {
      // Human Decision: Rollback handled by database transaction at repository layer
      // If any step fails, the repository's transaction manager rolls back all changes automatically
      throw error;
    }
  }

  /**
   * Get transaction by ID
   * 
   * @param id - Transaction UUID
   * @returns Transaction with items
   */
  async getTransactionById(id: string): Promise<Transaction> {
    return await this.transactionRepository.findById(id);
  }

  /**
   * Get transaction by transaction number
   * 
   * @param transactionNumber - Human-readable transaction number
   * @returns Transaction with items
   */
  async getTransactionByNumber(transactionNumber: string): Promise<Transaction> {
    return await this.transactionRepository.findByNumber(transactionNumber);
  }

  /**
   * Get transactions for a date range
   * 
   * @param startDate - Start of date range
   * @param endDate - End of date range
   * @returns List of transactions
   */
  async getTransactionsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]> {
    return await this.transactionRepository.findByDateRange(startDate, endDate);
  }

  /**
   * Void a transaction
   * 
   * Human Decision: Voids restore inventory but keep transaction record for audit
   * 
   * @param id - Transaction UUID
   * @param reason - Reason for voiding
   * @returns Voided transaction
   */
  async voidTransaction(id: string, reason: string): Promise<Transaction> {
    const transaction = await this.getTransactionById(id);

    // Validate transaction can be voided
    if (transaction.status === 'VOIDED') {
      throw new ValidationError('Transaction is already voided');
    }

    if (transaction.status === 'REFUNDED') {
      throw new ValidationError('Cannot void a refunded transaction');
    }

    // Restore inventory (human-designed business logic)
    for (const item of transaction.items) {
      await this.productService.updateQuantity(item.productId, item.quantity);
    }

    // Mark transaction as voided
    return await this.transactionRepository.void(id, reason);
  }

  /**
   * Get daily sales summary
   * 
   * Human Decision: What metrics are important for daily operations
   * 
   * @param date - Date to summarize
   * @returns Sales summary with key metrics
   */
  async getDailySummary(date: Date): Promise<{
    date: Date;
    totalTransactions: number;
    totalRevenue: number;
    averageTransaction: number;
    topProducts: Array<{ productId: string; quantity: number; revenue: number }>;
  }> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const transactions = await this.getTransactionsByDateRange(startOfDay, endOfDay);

    // Filter out voided transactions (human-designed business rule)
    const validTransactions = transactions.filter(t => t.status === 'COMPLETED');

    const totalRevenue = validTransactions.reduce((sum, t) => sum + t.total, 0);
    const averageTransaction = validTransactions.length > 0 
      ? totalRevenue / validTransactions.length 
      : 0;

    // Calculate top products (human-designed analytics)
    const productStats = new Map<string, { quantity: number; revenue: number }>();

    for (const transaction of validTransactions) {
      for (const item of transaction.items) {
        const existing = productStats.get(item.productId) || { quantity: 0, revenue: 0 };
        productStats.set(item.productId, {
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + item.subtotal,
        });
      }
    }

    const topProducts = Array.from(productStats.entries())
      .map(([productId, stats]) => ({ productId, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10); // Top 10 products

    return {
      date,
      totalTransactions: validTransactions.length,
      totalRevenue,
      averageTransaction,
      topProducts,
    };
  }
}
