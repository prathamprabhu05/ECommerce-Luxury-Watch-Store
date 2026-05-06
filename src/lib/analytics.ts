import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase/config';

export interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  todayRevenue: number;
  todayOrders: number;
  weekRevenue: number;
  weekOrders: number;
  monthRevenue: number;
  monthOrders: number;
  yearRevenue: number;
  yearOrders: number;
}

export interface ProductAnalytics {
  id: string;
  name: string;
  brand: string;
  totalSales: number;
  totalRevenue: number;
  stockQuantity: number;
  averageRating: number;
  totalReviews: number;
}

export interface OrderAnalytics {
  totalOrders: number;
  processingOrders: number;
  confirmedOrders: number;
  shippingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomersThisMonth: number;
  repeatCustomers: number;
  topCustomers: {
    userId: string;
    email: string;
    totalOrders: number;
    totalSpent: number;
  }[];
}

export interface RevenueByPeriod {
  date: string;
  revenue: number;
  orders: number;
}

// Get sales analytics
export const getSalesAnalytics = async (): Promise<SalesAnalytics> => {
  try {
    const ordersRef = collection(db, 'orders');
    const snapshot = await getDocs(ordersRef);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    let totalRevenue = 0;
    let totalOrders = 0;
    let todayRevenue = 0;
    let todayOrders = 0;
    let weekRevenue = 0;
    let weekOrders = 0;
    let monthRevenue = 0;
    let monthOrders = 0;
    let yearRevenue = 0;
    let yearOrders = 0;

    snapshot.docs.forEach((doc) => {
      const order = doc.data();
      
      // Skip cancelled orders
      if (order.status === 'Cancelled') return;

      const orderDate = order.createdAt?.toDate() || new Date(0);
      const orderTotal = order.total || 0;

      totalRevenue += orderTotal;
      totalOrders++;

      if (orderDate >= todayStart) {
        todayRevenue += orderTotal;
        todayOrders++;
      }

      if (orderDate >= weekStart) {
        weekRevenue += orderTotal;
        weekOrders++;
      }

      if (orderDate >= monthStart) {
        monthRevenue += orderTotal;
        monthOrders++;
      }

      if (orderDate >= yearStart) {
        yearRevenue += orderTotal;
        yearOrders++;
      }
    });

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      todayRevenue,
      todayOrders,
      weekRevenue,
      weekOrders,
      monthRevenue,
      monthOrders,
      yearRevenue,
      yearOrders,
    };
  } catch (error) {
    console.error('Error getting sales analytics:', error);
    return {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      todayRevenue: 0,
      todayOrders: 0,
      weekRevenue: 0,
      weekOrders: 0,
      monthRevenue: 0,
      monthOrders: 0,
      yearRevenue: 0,
      yearOrders: 0,
    };
  }
};

// Get order analytics
export const getOrderAnalytics = async (): Promise<OrderAnalytics> => {
  try {
    const ordersRef = collection(db, 'orders');
    const snapshot = await getDocs(ordersRef);

    let totalOrders = 0;
    let processingOrders = 0;
    let confirmedOrders = 0;
    let shippingOrders = 0;
    let deliveredOrders = 0;
    let cancelledOrders = 0;

    snapshot.docs.forEach((doc) => {
      const order = doc.data();
      totalOrders++;

      switch (order.status) {
        case 'Processing':
          processingOrders++;
          break;
        case 'Confirmed':
          confirmedOrders++;
          break;
        case 'Out for Delivery':
          shippingOrders++;
          break;
        case 'Delivered':
          deliveredOrders++;
          break;
        case 'Cancelled':
          cancelledOrders++;
          break;
      }
    });

    return {
      totalOrders,
      processingOrders,
      confirmedOrders,
      shippingOrders,
      deliveredOrders,
      cancelledOrders,
    };
  } catch (error) {
    console.error('Error getting order analytics:', error);
    return {
      totalOrders: 0,
      processingOrders: 0,
      confirmedOrders: 0,
      shippingOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
    };
  }
};

// Get top selling products
export const getTopSellingProducts = async (limitCount: number = 10): Promise<ProductAnalytics[]> => {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    const ordersRef = collection(db, 'orders');
    const ordersSnapshot = await getDocs(ordersRef);

    // Calculate sales for each product
    const productSales: { [key: string]: { quantity: number; revenue: number } } = {};

    ordersSnapshot.docs.forEach((doc) => {
      const order = doc.data();
      if (order.status !== 'Cancelled') {
        order.items?.forEach((item: any) => {
          if (!productSales[item.productId]) {
            productSales[item.productId] = { quantity: 0, revenue: 0 };
          }
          productSales[item.productId].quantity += item.quantity;
          productSales[item.productId].revenue += item.price * item.quantity;
        });
      }
    });

    // Map products with sales data
    const productsWithSales = snapshot.docs.map((doc) => {
      const data = doc.data();
      const sales = productSales[doc.id] || { quantity: 0, revenue: 0 };

      return {
        id: doc.id,
        name: data.name || '',
        brand: data.brand || '',
        totalSales: sales.quantity,
        totalRevenue: sales.revenue,
        stockQuantity: data.stockQuantity || 0,
        averageRating: data.averageRating || 0,
        totalReviews: data.totalReviews || 0,
      };
    });

    // Sort by total sales and limit
    return productsWithSales
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, limitCount);
  } catch (error) {
    console.error('Error getting top selling products:', error);
    return [];
  }
};

// Get revenue by period (for charts)
export const getRevenueByPeriod = async (
  period: 'week' | 'month' | 'year'
): Promise<RevenueByPeriod[]> => {
  try {
    const ordersRef = collection(db, 'orders');
    const snapshot = await getDocs(ordersRef);

    const now = new Date();
    let startDate: Date;
    let dateFormat: (date: Date) => string;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFormat = (date) => date.toLocaleDateString('en-US', { weekday: 'short' });
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFormat = (date) => date.toLocaleDateString('en-US', { day: 'numeric' });
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        dateFormat = (date) => date.toLocaleDateString('en-US', { month: 'short' });
        break;
    }

    const revenueByDate: { [key: string]: { revenue: number; orders: number } } = {};

    snapshot.docs.forEach((doc) => {
      const order = doc.data();
      if (order.status === 'Cancelled') return;

      const orderDate = order.createdAt?.toDate() || new Date(0);
      if (orderDate < startDate) return;

      const dateKey = dateFormat(orderDate);
      if (!revenueByDate[dateKey]) {
        revenueByDate[dateKey] = { revenue: 0, orders: 0 };
      }

      revenueByDate[dateKey].revenue += order.total || 0;
      revenueByDate[dateKey].orders++;
    });

    return Object.entries(revenueByDate).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders,
    }));
  } catch (error) {
    console.error('Error getting revenue by period:', error);
    return [];
  }
};

// Get customer analytics
export const getCustomerAnalytics = async (): Promise<CustomerAnalytics> => {
  try {
    const ordersRef = collection(db, 'orders');
    const snapshot = await getDocs(ordersRef);

    const customerData: {
      [key: string]: {
        email: string;
        orders: number;
        totalSpent: number;
        firstOrder: Date;
      };
    } = {};

    snapshot.docs.forEach((doc) => {
      const order = doc.data();
      if (order.status === 'Cancelled') return;

      const userId = order.userId;
      const email = order.customerEmail;
      const orderDate = order.createdAt?.toDate() || new Date();

      if (!customerData[userId]) {
        customerData[userId] = {
          email,
          orders: 0,
          totalSpent: 0,
          firstOrder: orderDate,
        };
      }

      customerData[userId].orders++;
      customerData[userId].totalSpent += order.total || 0;

      if (orderDate < customerData[userId].firstOrder) {
        customerData[userId].firstOrder = orderDate;
      }
    });

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalCustomers = Object.keys(customerData).length;
    const newCustomersThisMonth = Object.values(customerData).filter(
      (customer) => customer.firstOrder >= monthStart
    ).length;
    const repeatCustomers = Object.values(customerData).filter(
      (customer) => customer.orders > 1
    ).length;

    const topCustomers = Object.entries(customerData)
      .map(([userId, data]) => ({
        userId,
        email: data.email,
        totalOrders: data.orders,
        totalSpent: data.totalSpent,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    return {
      totalCustomers,
      newCustomersThisMonth,
      repeatCustomers,
      topCustomers,
    };
  } catch (error) {
    console.error('Error getting customer analytics:', error);
    return {
      totalCustomers: 0,
      newCustomersThisMonth: 0,
      repeatCustomers: 0,
      topCustomers: [],
    };
  }
};

// Get inventory analytics
export const getInventoryAnalytics = async () => {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);

    let totalProducts = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let totalInventoryValue = 0;

    snapshot.docs.forEach((doc) => {
      const product = doc.data();
      totalProducts++;

      const stock = product.stockQuantity || 0;
      const threshold = product.lowStockThreshold || 5;
      const price = product.price || 0;

      totalInventoryValue += stock * price;

      if (stock === 0) {
        outOfStock++;
      } else if (stock <= threshold) {
        lowStock++;
      }
    });

    return {
      totalProducts,
      lowStock,
      outOfStock,
      inStock: totalProducts - outOfStock,
      totalInventoryValue,
    };
  } catch (error) {
    console.error('Error getting inventory analytics:', error);
    return {
      totalProducts: 0,
      lowStock: 0,
      outOfStock: 0,
      inStock: 0,
      totalInventoryValue: 0,
    };
  }
};