import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
  RawBody,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('billing')
@ApiBearerAuth()
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // Customer Management
  @Post('customers')
  async createCustomer(
    @Body() data: {
      orgId: string;
      email: string;
      name?: string;
    }
  ) {
    return this.billingService.createCustomer(data.orgId, data.email, data.name);
  }

  @Get('customers/:customerId')
  async getCustomer(@Param('customerId') customerId: string) {
    return this.billingService.getCustomer(customerId);
  }

  @Patch('customers/:customerId')
  async updateCustomer(
    @Param('customerId') customerId: string,
    @Body() updates: any
  ) {
    return this.billingService.updateCustomer(customerId, updates);
  }

  // Subscription Management
  @Post('subscriptions')
  async createSubscription(
    @Body() data: {
      customerId: string;
      priceId: string;
      metadata?: Record<string, string>;
    }
  ) {
    return this.billingService.createSubscription(
      data.customerId,
      data.priceId,
      data.metadata
    );
  }

  @Get('subscriptions/:subscriptionId')
  async getSubscription(@Param('subscriptionId') subscriptionId: string) {
    return this.billingService.getSubscription(subscriptionId);
  }

  @Patch('subscriptions/:subscriptionId')
  async updateSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Body() updates: any
  ) {
    return this.billingService.updateSubscription(subscriptionId, updates);
  }

  @Delete('subscriptions/:subscriptionId')
  async cancelSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Query('immediately') immediately?: boolean
  ) {
    return this.billingService.cancelSubscription(
      subscriptionId,
      immediately === true
    );
  }

  // Payment Methods
  @Post('payment-methods/attach')
  async attachPaymentMethod(
    @Body() data: {
      paymentMethodId: string;
      customerId: string;
    }
  ) {
    return this.billingService.attachPaymentMethod(
      data.paymentMethodId,
      data.customerId
    );
  }

  @Delete('payment-methods/:paymentMethodId')
  async detachPaymentMethod(@Param('paymentMethodId') paymentMethodId: string) {
    return this.billingService.detachPaymentMethod(paymentMethodId);
  }

  @Get('payment-methods/:customerId')
  async listPaymentMethods(
    @Param('customerId') customerId: string,
    @Query('type') type?: string
  ) {
    return this.billingService.listPaymentMethods(customerId, type);
  }

  // Invoices
  @Post('invoices')
  async createInvoice(
    @Body() data: {
      customerId: string;
      items: Array<{
        description: string;
        amount: number;
        currency?: string;
      }>;
    }
  ) {
    return this.billingService.createInvoice(data.customerId, data.items);
  }

  @Get('invoices/:invoiceId')
  async getInvoice(@Param('invoiceId') invoiceId: string) {
    return this.billingService.getInvoice(invoiceId);
  }

  @Get('invoices/customer/:customerId')
  async listInvoices(
    @Param('customerId') customerId: string,
    @Query('limit') limit?: number
  ) {
    return this.billingService.listInvoices(customerId, limit);
  }

  // Usage Tracking
  @Post('usage')
  async recordUsage(
    @Body() data: {
      subscriptionItemId: string;
      quantity: number;
      timestamp?: number;
    }
  ) {
    return this.billingService.recordUsage(
      data.subscriptionItemId,
      data.quantity,
      data.timestamp
    );
  }

  @Get('usage/:subscriptionItemId')
  async getUsageSummary(@Param('subscriptionItemId') subscriptionItemId: string) {
    return this.billingService.getUsageSummary(subscriptionItemId);
  }

  // Products and Prices
  @Get('products')
  async listProducts() {
    return this.billingService.listProducts();
  }

  @Get('prices')
  async listPrices(@Query('productId') productId?: string) {
    return this.billingService.listPrices(productId);
  }

  // Database Operations
  @Post('records')
  async createBillingRecord(@Body() data: any) {
    return this.billingService.createBillingRecord(data);
  }

  @Get('records/:orgId')
  async findBillingRecords(@Param('orgId') orgId: string) {
    return this.billingService.findBillingRecords(orgId);
  }

  @Patch('records/:id')
  async updateBillingRecord(
    @Param('id') id: string,
    @Body() data: any
  ) {
    return this.billingService.updateBillingRecord(id, data);
  }

  @Get('usage/org/:orgId')
  async getBillingUsage(
    @Param('orgId') orgId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.billingService.getBillingUsage(orgId, start, end);
  }

  @Post('usage/record')
  async recordUsageInDatabase(
    @Body() data: {
      orgId: string;
      type: string;
      quantity: number;
      metadata?: any;
    }
  ) {
    return this.billingService.recordUsageInDatabase(
      data.orgId,
      data.type,
      data.quantity,
      data.metadata
    );
  }

  // Webhook Endpoint
  @Post('webhooks/stripe')
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    @RawBody() payload: Buffer,
    @Headers('stripe-signature') signature: string
  ) {
    try {
      const event = this.billingService.constructEvent(payload, signature);
      
      // Handle different event types
      switch (event.type) {
        case 'customer.subscription.created':
          // Handle subscription created
          break;
        case 'customer.subscription.updated':
          // Handle subscription updated
          break;
        case 'customer.subscription.deleted':
          // Handle subscription deleted
          break;
        case 'invoice.payment_succeeded':
          // Handle successful payment
          break;
        case 'invoice.payment_failed':
          // Handle failed payment
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      console.error('Webhook error:', error);
      return { error: error.message };
    }
  }
}