/**
 * Shapes returned by the Nexa Gadgets API (see the backend's
 * docs/FRONTEND_INTEGRATION.md). Fields marked optional can be missing on
 * records created before the redesign, so the UI must handle them absent.
 */

export type Role = "user" | "admin";

export interface SessionUser {
  id: string;
  email: string;
  userName: string;
  role: Role;
  marketingOptIn?: boolean;
}

export interface Profile {
  _id: string;
  userName: string;
  email: string;
  role: Role;
  marketingOptIn: boolean;
  createdAt: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: SessionUser;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

/* ---------- Catalog ---------- */

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  _id: string;
  image: string;
  images?: string[];
  title: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  salePrice: number;
  totalStock: number;
  specs?: ProductSpec[];
  averageReview?: number;
  numReviews?: number;
  effectivePrice?: number;
  createdAt?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ProductPage {
  success: boolean;
  data: Product[];
  pagination?: Pagination;
}

export type SortKey =
  "price-lowtohigh" | "price-hightolow" | "title-atoz" | "title-ztoa" | "newest" | "rating";

export interface ProductQuery {
  category?: string[];
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  sortBy?: SortKey;
  page?: number;
  limit?: number;
}

export interface Review {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  reviewMessage: string;
  reviewValue: number;
  createdAt: string;
}

/* ---------- Cart & wishlist ---------- */

export interface CartItem {
  productId: string;
  image: string | null;
  title: string;
  price: number | null;
  salePrice: number | null;
  quantity: number;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
}

export interface WishlistEntry {
  _id: string;
  product: Pick<
    Product,
    "_id" | "image" | "title" | "price" | "salePrice" | "averageReview" | "numReviews"
  > | null;
}

/* ---------- Addresses, delivery, orders ---------- */

export interface Address {
  _id: string;
  userId: string;
  address: string;
  city: string;
  phone: string;
  pincode?: string;
  notes?: string;
}

export type AddressInput = Pick<Address, "address" | "city" | "phone"> &
  Partial<Pick<Address, "pincode" | "notes">>;

export type DeliveryType = "pickup" | "delivery";

export interface DeliveryOption {
  _id: string;
  name: string;
  type: DeliveryType;
  fee: number;
  description: string;
  sortOrder: number;
  active?: boolean;
}

export type DeliveryOptionInput = Pick<DeliveryOption, "name" | "type" | "fee"> &
  Partial<Pick<DeliveryOption, "description" | "active" | "sortOrder">>;

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "inShipping"
  | "readyForPickup"
  | "delivered"
  | "rejected"
  // Legacy value on orders placed before the redesign.
  | "inProcess";

export type PaymentStatus = "pending" | "paid";

export interface OrderItem {
  productId: string;
  title: string;
  image: string;
  price: string;
  quantity: number;
}

export interface Order {
  _id: string;
  userId: string;
  cartItems: OrderItem[];
  addressInfo?: Partial<Omit<Address, "_id" | "userId">> & { addressId?: string };
  deliveryMethod?: {
    optionId: string;
    name: string;
    type: DeliveryType;
    fee: number;
    description?: string;
  };
  orderStatus: OrderStatus;
  paymentMethod?: string;
  paymentStatus: PaymentStatus;
  paymentChannel?: string;
  subtotal?: number;
  deliveryFee?: number;
  totalAmount: number;
  orderDate: string;
  orderUpdateDate?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
}

/* ---------- Admin ---------- */

export interface Analytics {
  analyticsData: { users: number; products: number; totalSales: number; totalRevenue: number };
  dailySalesData: { date: string; sales: number; revenue: number }[];
}

export type ProductInput = Pick<
  Product,
  "title" | "description" | "category" | "brand" | "price" | "salePrice" | "totalStock"
> & { images: string[]; specs: ProductSpec[] };
