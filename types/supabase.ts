export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string; // UUID
          name: string; // اسم المنتج
          description: string | null; // وصف المنتج
          price: number; // سعر المنتج
          stock: number; // كمية المنتج في المخزون
          category: string | null; // فئة المنتج
          image_url: string | null; // رابط صورة المنتج
          created_at: string; // تاريخ الإنشاء (ISO 8601)
          updated_at: string; // تاريخ التحديث (ISO 8601)
        };
        Insert: {
          id?: string; // UUID
          name: string; // اسم المنتج
          description?: string | null; // وصف المنتج
          price: number; // سعر المنتج
          stock: number; // كمية المنتج في المخزون
          category?: string | null; // فئة المنتج
          image_url?: string | null; // رابط صورة المنتج
          created_at?: string; // تاريخ الإنشاء (ISO 8601)
          updated_at?: string; // تاريخ التحديث (ISO 8601)
        };
        Update: {
          id?: string; // UUID
          name?: string; // اسم المنتج
          description?: string | null; // وصف المنتج
          price?: number; // سعر المنتج
          stock?: number; // كمية المنتج في المخزون
          category?: string | null; // فئة المنتج
          image_url?: string | null; // رابط صورة المنتج
          created_at?: string; // تاريخ الإنشاء (ISO 8601)
          updated_at?: string; // تاريخ التحديث (ISO 8601)
        };
      };
      profiles: {
        Row: {
          id: string; // UUID
          email: string; // البريد الإلكتروني (فريد)
          role: string; // دور المستخدم (مثل 'user' أو 'admin')
          is_admin: boolean; // هل المستخدم هو مدير
          full_name: string | null; // الاسم الكامل للمستخدم
          avatar_url: string | null; // رابط صورة الملف الشخصي
          created_at: string; // تاريخ الإنشاء (ISO 8601)
          updated_at: string; // تاريخ التحديث (ISO 8601)
        };
        Insert: {
          id?: string; // UUID
          email: string; // البريد الإلكتروني (فريد)
          role?: string; // دور المستخدم (افتراضي هو 'user')
          is_admin?: boolean; // هل المستخدم هو مدير
          full_name?: string | null; // الاسم الكامل للمستخدم
          avatar_url?: string | null; // رابط صورة الملف الشخصي
          created_at?: string; // تاريخ الإنشاء (ISO 8601)
          updated_at?: string; // تاريخ التحديث (ISO 8601)
        };
        Update: {
          id?: string; // UUID
          email?: string; // البريد الإلكتروني (فريد)
          role?: string; // دور المستخدم
          is_admin?: boolean; // هل المستخدم هو مدير
          full_name?: string | null; // الاسم الكامل للمستخدم
          avatar_url?: string | null; // رابط صورة الملف الشخصي
          created_at?: string; // تاريخ الإنشاء (ISO 8601)
          updated_at?: string; // تاريخ التحديث (ISO 8601)
        };
      };
      cart_items: {
        Row: {
          id: string; // UUID
          user_id: string; // UUID للمستخدم
          product_id: string; // UUID للمنتج
          quantity: number; // كمية المنتج في السلة
          created_at: string; // تاريخ الإنشاء (ISO 8601)
          updated_at: string; // تاريخ التحديث (ISO 8601)
        };
        Insert: {
          id?: string; // UUID
          user_id: string; // UUID للمستخدم
          product_id: string; // UUID للمنتج
          quantity: number; // كمية المنتج في السلة
          created_at?: string; // تاريخ الإنشاء (ISO 8601)
          updated_at?: string; // تاريخ التحديث (ISO 8601)
        };
        Update: {
          id?: string; // UUID
          user_id?: string; // UUID للمستخدم
          product_id?: string; // UUID للمنتج
          quantity?: number; // كمية المنتج في السلة
          created_at?: string; // تاريخ الإنشاء (ISO 8601)
          updated_at?: string; // تاريخ التحديث (ISO 8601)
        };
      };
      categories: {
        Row: {
          id: string; // UUID
          name: string; // اسم الفئة
          created_at: string; // تاريخ الإنشاء (ISO 8601)
          updated_at: string; // تاريخ التحديث (ISO 8601)
        };
        Insert: {
          id?: string; // UUID
          name: string; // اسم الفئة
          created_at?: string; // تاريخ الإنشاء (ISO 8601)
          updated_at?: string; // تاريخ التحديث (ISO 8601)
        };
        Update: {
          id?: string; // UUID
          name?: string; // اسم الفئة
          created_at?: string; // تاريخ الإنشاء (ISO 8601)
          updated_at?: string; // تاريخ التحديث (ISO 8601)
        };
      };
      order_items: {
        Row: {
          id: string; // UUID
          order_id: string; // UUID للطلب
          product_id: string; // UUID للمنتج
          quantity: number; // كمية المنتج في الطلب
          price: number; // سعر المنتج عند الطلب
          created_at: string; // تاريخ الإنشاء (ISO 8601)
          updated_at: string; // تاريخ التحديث (ISO 8601)
        };
        Insert: {
          id?: string; // UUID
          order_id: string; // UUID للطلب
          product_id: string; // UUID للمنتج
          quantity: number; // كمية المنتج في الطلب
          price: number; // سعر المنتج عند الطلب
          created_at?: string; // تاريخ الإنشاء (ISO 8601)
          updated_at?: string; // تاريخ التحديث (ISO 8601)
        };
        Update: {
          id?: string; // UUID
          order_id?: string; // UUID للطلب
          product_id?: string; // UUID للمنتج
          quantity?: number; // كمية المنتج في الطلب
          price?: number; // سعر المنتج عند الطلب
          created_at?: string; // تاريخ الإنشاء (ISO 8601)
          updated_at?: string; // تاريخ التحديث (ISO 8601)
        };
      };
      orders: {
        Row: {
          id: string; // UUID
          user_id: string; // UUID للمستخدم
          total_amount: number; // المبلغ الإجمالي للطلب
          status: string; // حالة الطلب (مثل 'pending', 'completed', 'canceled')
          created_at: string; // تاريخ الإنشاء (ISO 8601)
          updated_at: string; // تاريخ التحديث (ISO 8601)
        };
        Insert: {
          id?: string; // UUID
          user_id: string; // UUID للمستخدم
          total_amount: number; // المبلغ الإجمالي للطلب
          status?: string; // حالة الطلب (افتراضي هو 'pending')
          created_at?: string; // تاريخ الإنشاء (ISO 8601)
          updated_at?: string; // تاريخ التحديث (ISO 8601)
        };
        Update: {
          id?: string; // UUID
          user_id?: string; // UUID للمستخدم
          total_amount?: number; // المبلغ الإجمالي للطلب
          status?: string; // حالة الطلب
          created_at?: string; // تاريخ الإنشاء (ISO 8601)
          updated_at?: string; // تاريخ التحديث (ISO 8601)
        };
      };
      // أضف جداول أخرى حسب الحاجة
    };
    Views: {
      [_ in never]: never; // مكان للمشاهدات
    };
    Functions: {
      [_ in never]: never; // مكان للوظائف
    };
    Enums: {
      [_ in never]: never; // مكان للـ enums
    };
    CompositeTypes: {
      [_ in never]: never; // مكان للأنواع المركبة
    };
  };
}

