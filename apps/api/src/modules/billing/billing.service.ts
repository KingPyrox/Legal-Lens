import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  // Customer Management
  async createCustomer(orgId: string, email: string, name?: string) {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: {
          orgId,
        },
      });

      // Store customer in database
      await this.prisma.billingCustomer.create({
        data: {
          orgId,
          stripeCustomerId: customer.id,
        },
      });

      this.logger.log(`Created Stripe customer: ${customer.id} for org: ${orgId}`);
      return customer;
    } catch (error) {
      this.logger.error(`Failed to create customer for org ${orgId}:`, error);
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  async getCustomer(customerId: string) {
    try {
      return await this.stripe.customers.retrieve(customerId);
    } catch (error) {
      this.logger.error(`Failed to retrieve customer ${customerId}:`, error);
      throw new Error(`Failed to retrieve customer: ${error.message}`);
    }
  }

  async updateCustomer(customerId: string, updates: Stripe.CustomerUpdateParams) {
    try {
      return await this.stripe.customers.update(customerId, updates);
    } catch (error) {
      this.logger.error(`Failed to update customer ${customerId}:`, error);
      throw new Error(`Failed to update customer: ${error.message}`);
    }
  }

  // Subscription Management
  async createSubscription(customerId: string, priceId: string, metadata?: Record<string, string>) {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata,
        expand: ['latest_invoice.payment_intent'],
      });

      this.logger.log(`Created subscription: ${subscription.id} for customer: ${customerId}`);
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to create subscription for customer ${customerId}:`, error);
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  async getSubscription(subscriptionId: string) {
    try {
      return await this.stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      this.logger.error(`Failed to retrieve subscription ${subscriptionId}:`, error);
      throw new Error(`Failed to retrieve subscription: ${error.message}`);
    }
  }

  async updateSubscription(subscriptionId: string, updates: Stripe.SubscriptionUpdateParams) {
    try {
      return await this.stripe.subscriptions.update(subscriptionId, updates);
    } catch (error) {
      this.logger.error(`Failed to update subscription ${subscriptionId}:`, error);
      throw new Error(`Failed to update subscription: ${error.message}`);
    }
  }

  async cancelSubscription(subscriptionId: string, immediately: boolean = false) {
    try {
      if (immediately) {
        return await this.stripe.subscriptions.cancel(subscriptionId);
      } else {
        return await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      }
    } catch (error) {
      this.logger.error(`Failed to cancel subscription ${subscriptionId}:`, error);
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  // Payment Methods
  async attachPaymentMethod(paymentMethodId: string, customerId: string) {
    try {
      return await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
    } catch (error) {
      this.logger.error(`Failed to attach payment method ${paymentMethodId}:`, error);
      throw new Error(`Failed to attach payment method: ${error.message}`);
    }
  }

  async detachPaymentMethod(paymentMethodId: string) {
    try {
      return await this.stripe.paymentMethods.detach(paymentMethodId);
    } catch (error) {
      this.logger.error(`Failed to detach payment method ${paymentMethodId}:`, error);
      throw new Error(`Failed to detach payment method: ${error.message}`);
    }
  }

  async listPaymentMethods(customerId: string, type: string = 'card') {
    try {
      return await this.stripe.paymentMethods.list({
        customer: customerId,
        type: type as any,
      });
    } catch (error) {
      this.logger.error(`Failed to list payment methods for customer ${customerId}:`, error);
      throw new Error(`Failed to list payment methods: ${error.message}`);
    }
  }

  // Invoices
  async createInvoice(customerId: string, items: Array<{ description: string; amount: number; currency?: string }>) {
    try {
      // Create invoice items
      for (const item of items) {
        await this.stripe.invoiceItems.create({
          customer: customerId,
          amount: item.amount,
          currency: item.currency || 'usd',
          description: item.description,
        });
      }

      // Create and finalize invoice
      const invoice = await this.stripe.invoices.create({
        customer: customerId,
        auto_advance: true,
      });

      return await this.stripe.invoices.finalizeInvoice(invoice.id);
    } catch (error) {
      this.logger.error(`Failed to create invoice for customer ${customerId}:`, error);
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
  }

  async getInvoice(invoiceId: string) {
    try {
      return await this.stripe.invoices.retrieve(invoiceId);
    } catch (error) {
      this.logger.error(`Failed to retrieve invoice ${invoiceId}:`, error);
      throw new Error(`Failed to retrieve invoice: ${error.message}`);
    }
  }

  async listInvoices(customerId: string, limit: number = 10) {
    try {
      return await this.stripe.invoices.list({
        customer: customerId,
        limit,
      });
    } catch (error) {
      this.logger.error(`Failed to list invoices for customer ${customerId}:`, error);
      throw new Error(`Failed to list invoices: ${error.message}`);
    }
  }

  // Usage tracking
  async recordUsage(subscriptionItemId: string, quantity: number, timestamp?: number) {
    try {
      return await this.stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
        quantity,
        timestamp: timestamp || Math.floor(Date.now() / 1000),
        action: 'increment',
      });
    } catch (error) {
      this.logger.error(`Failed to record usage for subscription item ${subscriptionItemId}:`, error);
      throw new Error(`Failed to record usage: ${error.message}`);
    }
  }

  async getUsageSummary(subscriptionItemId: string) {
    try {
      return await this.stripe.subscriptionItems.listUsageRecordSummaries(subscriptionItemId);
    } catch (error) {
      this.logger.error(`Failed to get usage summary for subscription item ${subscriptionItemId}:`, error);
      throw new Error(`Failed to get usage summary: ${error.message}`);
    }
  }

  // Products and Prices
  async listProducts() {
    try {
      return await this.stripe.products.list({ active: true });
    } catch (error) {
      this.logger.error('Failed to list products:', error);
      throw new Error(`Failed to list products: ${error.message}`);
    }
  }

  async listPrices(productId?: string) {
    try {
      return await this.stripe.prices.list({
        active: true,
        ...(productId && { product: productId }),
      });
    } catch (error) {
      this.logger.error('Failed to list prices:', error);
      throw new Error(`Failed to list prices: ${error.message}`);
    }
  }

  // Webhook handling
  constructEvent(payload: string | Buffer, signature: string) {
    try {
      const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      this.logger.error('Failed to construct webhook event:', error);
      throw new Error(`Webhook signature verification failed: ${error.message}`);
    }
  }

  // Database operations
  async createBillingRecord(data: any) {
    return this.prisma.billingCustomer.create({
      data,
    });
  }

  async findBillingRecords(orgId: string) {
    return this.prisma.billingCustomer.findUnique({
      where: { orgId },
    });
  }

  async updateBillingRecord(orgId: string, data: any) {
    return this.prisma.billingCustomer.update({
      where: { orgId },
      data,
    });
  }

  async getBillingUsage(orgId: string, startDate?: Date, endDate?: Date) {
    // Use audit logs for usage tracking
    const where: any = { 
      orgId,
      action: 'api_usage'
    };
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    return this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async recordUsageInDatabase(orgId: string, type: string, quantity: number, metadata?: any) {
    return this.prisma.auditLog.create({
      data: {
        orgId,
        action: 'api_usage',
        targetType: type,
        metaJson: {
          quantity,
          ...metadata
        },
      },
    });
  }
}